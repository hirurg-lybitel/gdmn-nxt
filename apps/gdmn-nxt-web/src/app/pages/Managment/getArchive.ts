import { IKanbanCard, IKanbanColumn } from "@gsbelarus/util-api-types";

export const getArchive = (columns:IKanbanColumn[]):IKanbanColumn[] => {
  let completed:IKanbanCard[] = []
  let denied:IKanbanCard[] = []
  columns.forEach(column => column.CARDS.forEach(card => {
    if(card.DEAL?.USR$DONE){
      completed.push(card)
    }
    if(card.DEAL?.DENIED){
      denied.push(card)
    }
  }))
  return [
    {
      CARDS:denied,
      ID:1,
      USR$INDEX:0,
      USR$NAME:'Отказ'
    },
    {
      CARDS:completed,
      ID:2,
      USR$INDEX:1,
      USR$NAME:'Исполнено'
    }
  ]
}
