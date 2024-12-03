import { AddItemForm } from "common/components"
import { useAppDispatch } from "common/hooks"
import { DomainTodolist } from "../../../model/todolistsSlice"

import { FilterTasksButtons } from "./FilterTasksButtons/FilterTasksButtons"
import { Tasks } from "./Tasks/Tasks"
import { TodolistTitle } from "./TodolistTitle/TodolistTitle"
import {useCreateTaskMutation} from "../../../api/_tasksApi";

type Props = {
  todolist: DomainTodolist
}

export const Todolist = ({ todolist }: Props) => {
  const dispatch = useAppDispatch()
const [CreateTask]=useCreateTaskMutation()
  const addTaskCallback = (title: string) => {
      CreateTask({ title, todolistId: todolist.id })
      //dispatch(addTaskTC({ title, todolistId: todolist.id }))
  }

  return (
    <>
      <TodolistTitle todolist={todolist} />
      <AddItemForm addItem={addTaskCallback} disabled={todolist.entityStatus === "loading"} />
      <Tasks todolist={todolist} />
      <FilterTasksButtons todolist={todolist} />
    </>
  )
}
