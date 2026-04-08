export interface DesktopItem {
    id: string;
    userId: string;
    type: 'folder' | 'file' | 'link';
    name: string;
    content?: string;
    url?: string;
    parentId?: string;
    icon?: string;
    color?: string;
    position: number;
    createdAt: string;
    updatedAt: string;
}
export declare class MockDesktopRepository {
    private items;
    findByUser(userId: string, parentId?: string): Promise<DesktopItem[]>;
    findById(id: string): Promise<DesktopItem | null>;
    create(data: Omit<DesktopItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<DesktopItem>;
    update(id: string, data: Partial<DesktopItem>): Promise<DesktopItem | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=desktop.repository.d.ts.map