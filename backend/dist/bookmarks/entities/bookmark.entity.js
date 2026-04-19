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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bookmark = void 0;
const typeorm_1 = require("typeorm");
const bookmark_collection_entity_1 = require("./bookmark-collection.entity");
const place_entity_1 = require("../../places/entities/place.entity");
let Bookmark = class Bookmark {
    collection_id;
    place_id;
    collection;
    place;
    created_at;
};
exports.Bookmark = Bookmark;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid' }),
    __metadata("design:type", String)
], Bookmark.prototype, "collection_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid' }),
    __metadata("design:type", String)
], Bookmark.prototype, "place_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bookmark_collection_entity_1.BookmarkCollection, (collection) => collection.bookmarks, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'collection_id' }),
    __metadata("design:type", bookmark_collection_entity_1.BookmarkCollection)
], Bookmark.prototype, "collection", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => place_entity_1.Place, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'place_id' }),
    __metadata("design:type", place_entity_1.Place)
], Bookmark.prototype, "place", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Bookmark.prototype, "created_at", void 0);
exports.Bookmark = Bookmark = __decorate([
    (0, typeorm_1.Entity)('bookmarks')
], Bookmark);
//# sourceMappingURL=bookmark.entity.js.map