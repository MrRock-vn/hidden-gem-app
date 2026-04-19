export declare class QueryPlaceDto {
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'latest' | 'popular' | 'nearest';
}
