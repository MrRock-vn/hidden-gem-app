"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const places_module_1 = require("./places/places.module");
const social_module_1 = require("./social/social.module");
const bookmarks_module_1 = require("./bookmarks/bookmarks.module");
const notifications_module_1 = require("./notifications/notifications.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const user_entity_1 = require("./users/entities/user.entity");
const place_entity_1 = require("./places/entities/place.entity");
const place_image_entity_1 = require("./places/entities/place-image.entity");
const like_entity_1 = require("./social/entities/like.entity");
const comment_entity_1 = require("./social/entities/comment.entity");
const follow_entity_1 = require("./social/entities/follow.entity");
const block_entity_1 = require("./social/entities/block.entity");
const bookmark_collection_entity_1 = require("./bookmarks/entities/bookmark-collection.entity");
const bookmark_entity_1 = require("./bookmarks/entities/bookmark.entity");
const notification_entity_1 = require("./notifications/entities/notification.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST', 'localhost'),
                    port: configService.get('DATABASE_PORT', 5432),
                    username: configService.get('DATABASE_USERNAME', 'postgres'),
                    password: configService.get('DATABASE_PASSWORD', 'password'),
                    database: configService.get('DATABASE_NAME', 'hiddenGem'),
                    entities: [
                        user_entity_1.User,
                        place_entity_1.Place,
                        place_image_entity_1.PlaceImage,
                        like_entity_1.Like,
                        comment_entity_1.Comment,
                        follow_entity_1.Follow,
                        block_entity_1.Block,
                        bookmark_collection_entity_1.BookmarkCollection,
                        bookmark_entity_1.Bookmark,
                        notification_entity_1.Notification,
                    ],
                    synchronize: true,
                    logging: configService.get('NODE_ENV') === 'development',
                }),
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            places_module_1.PlacesModule,
            social_module_1.SocialModule,
            bookmarks_module_1.BookmarksModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map