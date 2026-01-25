"""JSON file storage service for persistence."""

import json
from pathlib import Path
from typing import TypeVar, Generic, List, Optional, Type
from pydantic import BaseModel
import aiofiles
import asyncio


T = TypeVar('T', bound=BaseModel)


class StorageService(Generic[T]):
    """Generic JSON file storage service."""
    
    def __init__(self, file_path: Path, model_class: Type[T]):
        self.file_path = file_path
        self.model_class = model_class
        self._ensure_file_exists()
    
    def _ensure_file_exists(self) -> None:
        """Ensure the storage file and parent directories exist."""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.file_path.exists():
            self.file_path.write_text("[]")
    
    async def _read_file(self) -> List[dict]:
        """Read and parse the JSON file."""
        async with aiofiles.open(self.file_path, 'r') as f:
            content = await f.read()
            return json.loads(content) if content.strip() else []
    
    async def _write_file(self, data: List[dict]) -> None:
        """Write data to the JSON file."""
        async with aiofiles.open(self.file_path, 'w') as f:
            await f.write(json.dumps(data, indent=2, default=str))
    
    async def get_all(self) -> List[T]:
        """Get all items from storage."""
        data = await self._read_file()
        return [self.model_class(**item) for item in data]
    
    async def get_by_id(self, item_id: str) -> Optional[T]:
        """Get a single item by ID."""
        data = await self._read_file()
        for item in data:
            if item.get('id') == item_id:
                return self.model_class(**item)
        return None
    
    async def create(self, item: T) -> T:
        """Create a new item."""
        data = await self._read_file()
        data.append(item.model_dump())
        await self._write_file(data)
        return item
    
    async def update(self, item_id: str, updates: dict) -> Optional[T]:
        """Update an existing item."""
        data = await self._read_file()
        for i, item in enumerate(data):
            if item.get('id') == item_id:
                # Filter out None values from updates
                filtered_updates = {k: v for k, v in updates.items() if v is not None}
                item.update(filtered_updates)
                data[i] = item
                await self._write_file(data)
                return self.model_class(**item)
        return None
    
    async def delete(self, item_id: str) -> bool:
        """Delete an item by ID."""
        data = await self._read_file()
        original_length = len(data)
        data = [item for item in data if item.get('id') != item_id]
        if len(data) < original_length:
            await self._write_file(data)
            return True
        return False
    
    async def get_active(self) -> List[T]:
        """Get all active items (items with active=True)."""
        all_items = await self.get_all()
        return [item for item in all_items if getattr(item, 'active', True)]
