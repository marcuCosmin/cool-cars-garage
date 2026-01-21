import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"

import type { DocWithID } from "@/globals/firestore/firestore.model"

type UseDNDListProps<Item extends DocWithID<Record<string, any>>> = {
  items: Item[]
  setItems: (items: Item[]) => void
}

export const useDNDList = <Item extends DocWithID<Record<string, any>>>({
  items,
  setItems
}: UseDNDListProps<Item>) => {
  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)

  const sensors = useSensors(mouseSensor, touchSensor)

  const onListDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      return
    }

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(({ id }) => id === active.id)
      const newIndex = items.findIndex(({ id }) => id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
    }
  }

  return { sensors, onListDragEnd }
}
