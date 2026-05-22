"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const places_service_1 = require("./places.service");
const places_controller_1 = require("./places.controller");
const media_module_1 = require("../media/media.module");
const notifications_module_1 = require("../notifications/notifications.module");
const place_entity_1 = require("./entities/place.entity");
const place_image_entity_1 = require("./entities/place-image.entity");
const like_entity_1 = require("../social/entities/like.entity");
const bookmark_entity_1 = require("../bookmarks/entities/bookmark.entity");
const user_entity_1 = require("../users/entities/user.entity");
let PlacesModule = class PlacesModule {
};
exports.PlacesModule = PlacesModule;
exports.PlacesModule = PlacesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([place_entity_1.Place, place_image_entity_1.PlaceImage, like_entity_1.Like, bookmark_entity_1.Bookmark, user_entity_1.User]),
            media_module_1.MediaModule,
            notifications_module_1.NotificationsModule,
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                fileFilter: (req, file, cb) => {
                    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|heic|heif)$/i)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'), false);
                    }
                },
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
        ],
        controllers: [places_controller_1.PlacesController],
        providers: [places_service_1.PlacesService],
        exports: [places_service_1.PlacesService],
    })
], PlacesModule);
//# sourceMappingURL=places.module.js.map