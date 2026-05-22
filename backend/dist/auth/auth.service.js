"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const user_entity_1 = require("../users/entities/user.entity");
let AuthService = class AuthService {
    usersRepository;
    jwtService;
    configService;
    googleClient;
    constructor(usersRepository, jwtService, configService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
        if (googleClientId) {
            this.googleClient = new google_auth_library_1.OAuth2Client(googleClientId);
        }
    }
    async register(registerDto) {
        const { username, email, password } = registerDto;
        const existingUser = await this.usersRepository.findOne({
            where: [{ email }, { username }],
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('Email đã được sử dụng');
            }
            throw new common_1.ConflictException('Username đã được sử dụng');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            username,
            email,
            password: hashedPassword,
        });
        await this.usersRepository.save(user);
        const tokens = await this.generateTokens(user);
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Tài khoản này sử dụng đăng nhập bằng mạng xã hội');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        const tokens = await this.generateTokens(user);
        await this.usersRepository.update(user.id, {
            refresh_token: tokens.refreshToken,
        });
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async googleAuth(token) {
        try {
            if (!this.googleClient) {
                throw new common_1.BadRequestException('Google OAuth not configured');
            }
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new common_1.BadRequestException('Invalid Google token');
            }
            const { sub: googleId, email, name, picture } = payload;
            let user = await this.usersRepository.findOne({
                where: { google_id: googleId },
            });
            if (!user) {
                const existingUser = await this.usersRepository.findOne({
                    where: { email: email },
                });
                if (existingUser) {
                    existingUser.google_id = googleId;
                    user = await this.usersRepository.save(existingUser);
                }
                else {
                    user = this.usersRepository.create({
                        email: email,
                        username: name || email?.split('@')[0] || 'user_' + Date.now(),
                        google_id: googleId,
                        avatar_url: picture || undefined,
                    });
                    user = await this.usersRepository.save(user);
                }
            }
            const tokens = await this.generateTokens(user);
            await this.usersRepository.update(user.id, {
                refresh_token: tokens.refreshToken,
            });
            return {
                user: this.sanitizeUser(user),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }
        catch (error) {
            console.error('Google auth error:', error);
            throw new common_1.BadRequestException('Google authentication failed');
        }
    }
    async appleAuth(token) {
        void token;
        throw new common_1.BadRequestException('Apple authentication is disabled until server-side token verification is implemented');
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.usersRepository.findOne({
                where: { id: payload.sub, refresh_token: refreshToken },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Token không hợp lệ');
            }
            const tokens = await this.generateTokens(user);
            await this.usersRepository.update(user.id, {
                refresh_token: tokens.refreshToken,
            });
            return tokens;
        }
        catch {
            throw new common_1.UnauthorizedException('Token hết hạn hoặc không hợp lệ');
        }
    }
    async logout(userId) {
        await this.usersRepository.update(userId, {
            refresh_token: null,
        });
        return { message: 'Đăng xuất thành công' };
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            this.jwtService.signAsync(payload, {
                expiresIn: '7d',
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        const { password, refresh_token, google_id, apple_id, ...sanitized } = user;
        return sanitized;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map