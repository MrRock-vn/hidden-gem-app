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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const follow_entity_1 = require("../social/entities/follow.entity");
const block_entity_1 = require("../social/entities/block.entity");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    usersRepository;
    followsRepository;
    blocksRepository;
    constructor(usersRepository, followsRepository, blocksRepository) {
        this.usersRepository = usersRepository;
        this.followsRepository = followsRepository;
        this.blocksRepository = blocksRepository;
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        return this.sanitizeUser(user);
    }
    async getProfile(userId, currentUserId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        const [followersCount, followingCount] = await Promise.all([
            this.followsRepository.count({ where: { following_id: userId } }),
            this.followsRepository.count({ where: { follower_id: userId } }),
        ]);
        let isFollowing = false;
        let isBlocked = false;
        if (currentUserId && currentUserId !== userId) {
            const [follow, block] = await Promise.all([
                this.followsRepository.findOne({
                    where: { follower_id: currentUserId, following_id: userId },
                }),
                this.blocksRepository.findOne({
                    where: { blocker_id: currentUserId, blocked_id: userId },
                }),
            ]);
            isFollowing = !!follow;
            isBlocked = !!block;
        }
        return {
            ...this.sanitizeUser(user),
            followers_count: followersCount,
            following_count: followingCount,
            is_following: isFollowing,
            is_blocked: isBlocked,
        };
    }
    async updateProfile(userId, updateUserDto) {
        if (updateUserDto.username) {
            const existing = await this.usersRepository.findOne({
                where: { username: updateUserDto.username },
            });
            if (existing && existing.id !== userId) {
                throw new common_1.ConflictException('Username đã được sử dụng');
            }
        }
        await this.usersRepository.update(userId, updateUserDto);
        return this.findById(userId);
    }
    async updateAvatar(userId, avatarUrl) {
        await this.usersRepository.update(userId, { avatar_url: avatarUrl });
        return this.findById(userId);
    }
    async updateEmail(userId, email) {
        const existing = await this.usersRepository.findOne({ where: { email } });
        if (existing && existing.id !== userId) {
            throw new common_1.ConflictException('Email da duoc su dung');
        }
        await this.usersRepository.update(userId, { email });
        return this.findById(userId);
    }
    async updatePassword(userId, currentPassword, newPassword) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Khong tim thay nguoi dung');
        if (!user.password) {
            throw new common_1.BadRequestException('Tai khoan nay khong co mat khau cuc bo');
        }
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            throw new common_1.UnauthorizedException('Mat khau hien tai khong dung');
        }
        await this.usersRepository.update(userId, {
            password: await bcrypt.hash(newPassword, 10),
            refresh_token: null,
        });
        return { message: 'Da doi mat khau' };
    }
    async getSettings(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        return {
            push_notifications: user.push_notifications_enabled,
            is_private: user.is_private,
            dark_mode: false,
            email: user.email,
        };
    }
    async updateSettings(userId, settings) {
        const updateData = {};
        if (settings.is_private !== undefined) {
            updateData.is_private = settings.is_private;
        }
        if (settings.push_notifications !== undefined) {
            updateData.push_notifications_enabled = settings.push_notifications;
        }
        if (Object.keys(updateData).length > 0) {
            await this.usersRepository.update(userId, updateData);
        }
        return this.getSettings(userId);
    }
    async blockUser(blockerId, blockedId) {
        if (blockerId === blockedId) {
            throw new common_1.ConflictException('Không thể tự block bản thân');
        }
        const existing = await this.blocksRepository.findOne({
            where: { blocker_id: blockerId, blocked_id: blockedId },
        });
        if (existing) {
            await this.blocksRepository.remove(existing);
            return { blocked: false };
        }
        const block = this.blocksRepository.create({
            blocker_id: blockerId,
            blocked_id: blockedId,
        });
        await Promise.all([
            this.blocksRepository.save(block),
            this.followsRepository.delete({
                follower_id: blockerId,
                following_id: blockedId,
            }),
            this.followsRepository.delete({
                follower_id: blockedId,
                following_id: blockerId,
            }),
        ]);
        return { blocked: true };
    }
    async getBlockedUsers(userId) {
        const blocks = await this.blocksRepository.find({
            where: { blocker_id: userId },
            relations: ['blocked'],
        });
        return blocks.map((b) => this.sanitizeUser(b.blocked));
    }
    async updateDeviceToken(userId, deviceToken) {
        const updateData = {
            device_token: deviceToken === null ? null : deviceToken,
        };
        await this.usersRepository.update(userId, updateData);
        return {
            success: true,
            message: deviceToken ? 'Device token registered' : 'Device token removed',
        };
    }
    async deleteAccount(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Khong tim thay nguoi dung');
        await this.usersRepository.remove(user);
        return { message: 'Da xoa tai khoan' };
    }
    sanitizeUser(user) {
        const { password, refresh_token, google_id, apple_id, ...sanitized } = user;
        return sanitized;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(follow_entity_1.Follow)),
    __param(2, (0, typeorm_1.InjectRepository)(block_entity_1.Block)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map