import { useLocation } from "react-router"
import { useQueryClient, type InfiniteData } from "@tanstack/react-query"

import type { RawDataListItem } from "@/globals/dataLists/dataLists.model"

export const useCommonItemsActions = <RawItem extends RawDataListItem>() => {
  const queryClient = useQueryClient()
  const { pathname } = useLocation()

  const handleItemEdit = (updatedItem: RawItem) => {
    queryClient.setQueriesData(
      {
        queryKey: [pathname],
        exact: false
      },
      (data: InfiniteData<RawItem[]>) => {
        const pages = data.pages.map(page => {
          const index = page.findIndex(i => i.id === updatedItem.id)

          if (index === -1) {
            return page
          }

          const updatedPage = page.slice()
          updatedPage[index] = updatedItem

          return updatedPage
        })

        return {
          ...data,
          pages
        }
      }
    )
  }

  const handleItemDelete = (id: RawItem["id"]) => {
    queryClient.setQueriesData(
      {
        queryKey: [pathname],
        exact: false
      },
      (data: InfiniteData<RawItem[]>) => {
        const pages = data.pages.map(page =>
          page.filter(item => item.id !== id)
        )

        return {
          ...data,
          pages
        }
      }
    )
  }

  return {
    handleItemEdit,
    handleItemDelete
  }
}
