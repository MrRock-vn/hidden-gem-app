"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const places_service_1 = require("./places.service");
const create_place_dto_1 = require("./dto/create-place.dto");
const query_place_dto_1 = require("./dto/query-place.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let PlacesController = class PlacesController {
    placesService;
    constructor(placesService) {
        this.placesService = placesService;
    }
    async findAll(query) {
        return this.placesService.findAll(query);
    }
    async findNearby(lat, lng, radius, limit) {
        return this.placesService.findNearby(+lat, +lng, radius ? +radius : undefined, limit ? +limit : undefined);
    }
    async findOne(id, currentUserId) {
        return this.placesService.findById(id, currentUserId);
    }
    async create(userId, createPlaceDto, files) {
        const imageUrls = files?.map((f) => `/uploads/places/${f.filename}`) || [];
        return this.placesService.create(userId, createPlaceDto, imageUrls);
    }
    async toggleLike(userId, placeId) {
        return this.placesService.toggleLike(userId, placeId);
    }
    async delete(placeId, userId) {
        return this.placesService.deletePlace(placeId, userId);
    }
    async getUserPlaces(userId, page, limit) {
        return this.placesService.getUserPlaces(userId, page ? +page : undefined, limit ? +limit : undefined);
    }
};
exports.PlacesController = PlacesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_place_dto_1.QueryPlaceDto]),
    __metadata("design:returntype", Promise)
], PlacesController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('nearby'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], PlacesController.prototype, "findNearby", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlacesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_place_dto_1.CreatePlaceDto, Array]),
    __metadata("design:returntype", Promise)
], PlacesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlacesController.prototype, "toggleLike", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlacesController.prototype, "delete", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PlacesController.prototype, "getUserPlaces", null);
exports.PlacesController = PlacesController = __decorate([
    (0, common_1.Controller)('places'),
    __metadata("design:paramtypes", [places_service_1.PlacesService])
], PlacesController);
//# sourceMappingURL=places.controller.js.map