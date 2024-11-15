import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskArgs,
    UpdateTaskModelType
} from "api/todolists-api";
import {AppThunk} from "app/store";
import {handleServerAppError, handleServerNetworkError} from "utils/error-utils";
import {appActions} from "app/app.reducer";
import {todolistsActions} from "features/TodolistsList/todolists.reducer";
import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {createAppAsyncThunk} from "../../utils/createAppAsyncThunk";

const initialState: TasksStateType = {};

const slice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {
            const tasks = state[action.payload.todolistId];
            const index = tasks.findIndex((t) => t.id === action.payload.taskId);
            if (index !== -1) tasks.splice(index, 1);
        },
        // addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
        //     const tasks = state[action.payload.task.todoListId];
        //     tasks.unshift(action.payload.task);
        // },
        updateTaskAPI: (
            state,
            action: PayloadAction<{
                taskId: string;
                model: UpdateDomainTaskModelType;
                todolistId: string;
            }>
        ) => {
            const tasks = state[action.payload.todolistId];
            const index = tasks.findIndex((t) => t.id === action.payload.taskId);
            if (index !== -1) {
                tasks[index] = {...tasks[index], ...action.payload.model};
            }
        },
        // setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>) => {
        //     state[action.payload.todolistId] = action.payload.tasks;
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(todolistsActions.addTodolist, (state, action) => {
                state[action.payload.todolist.id] = [];
            })
            .addCase(todolistsActions.removeTodolist, (state, action) => {
                delete state[action.payload.id];
            })
            .addCase(todolistsActions.setTodolists, (state, action) => {
                action.payload.todolists.forEach((tl) => {
                    state[tl.id] = [];
                });
            })
            .addCase(clearTasksAndTodolists, () => {
                return {};
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks;
            })
            .addCase(addTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.task.todoListId];
                tasks.unshift(action.payload.task);
            })
            .addCase(removeTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.arg.todolistId];
                const index = tasks.findIndex((t) => t.id === action.payload.arg.taskId);
                if (index !== -1) tasks.splice(index, 1);
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId];
                const index = tasks.findIndex((t) => t.id === action.payload.taskId);
                if (index !== -1) {
                    tasks[index] = {...tasks[index], ...action.payload.domainModel};
                }
            })
    },
});


export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
// thunks
export const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string }, string>(
    'tasks/fetchTasks', async (todolistId: string, thunkAPI) => {
        const {dispatch, rejectWithValue, getState} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsAPI.getTasks(todolistId)
            const tasks = res.data.items;
            dispatch(appActions.setAppStatus({status: "succeeded"}));
            return {todolistId, tasks}
        } catch (error) {
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    })
export const removeTask = createAppAsyncThunk<{ arg: { taskId: string, todolistId: string } }, { taskId: string, todolistId: string }>
('tasks/removeTask', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        await todolistsAPI.deleteTask(arg.todolistId, arg.taskId)
        return {arg}
    } catch (error) {
        handleServerNetworkError(error, dispatch);
        return rejectWithValue(null)
    }
})
export const addTask = createAppAsyncThunk<{ task: TaskType }, { title: string, todolistId: string }>
('tasks/addTask', async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsAPI.createTask(arg.todolistId, arg.title)
            if (res.data.resultCode === 0) {
                const task = res.data.data.item;
                dispatch(appActions.setAppStatus({status: "succeeded"}));
                return {task}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch
            (error) {
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    }
)

export const updateTask = createAppAsyncThunk<UpdateTaskArgs, UpdateTaskArgs>
('tasks/updateTask', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue, getState} = thunkAPI
    try {
        const state = getState();
        const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
        if (!task) {
            console.warn("task not found in the state");
            return rejectWithValue(null)
        }
        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...arg.domainModel,
        };
        const res = await todolistsAPI.updateTaskAPI(arg.todolistId, arg.taskId, apiModel)
        if (res.data.resultCode === 0) {
            return {taskId: arg.taskId, domainModel: arg.domainModel, todolistId: arg.todolistId}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }

    } catch (error) {
        handleServerNetworkError(error, dispatch);
        return rejectWithValue(null)
    }
})

// export const updateTaskTC =
//     (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
//         (dispatch, getState) => {
//             const state = getState();
//             const task = state.tasks[todolistId].find((t) => t.id === taskId);
//             if (!task) {
//                 //throw new Error("task not found in the state");
//                 console.warn("task not found in the state");
//                 return;
//             }
//             const apiModel: UpdateTaskModelType = {
//                 deadline: task.deadline,
//                 description: task.description,
//                 priority: task.priority,
//                 startDate: task.startDate,
//                 title: task.title,
//                 status: task.status,
//                 ...domainModel,
//
//             };
//
//             todolistsAPI
//                 .updateTask(todolistId, taskId, apiModel)
//                 .then((res) => {
//                     if (res.data.resultCode === 0) {
//                         dispatch(tasksActions.updateTask({taskId, model: domainModel, todolistId}));
//                     } else {
//                         handleServerAppError(res.data, dispatch);
//                     }
//                 })
//                 .catch((error) => {
//                     handleServerNetworkError(error, dispatch);
//                 });
//         };

// types
export type UpdateDomainTaskModelType = {
    title?: string;
    description?: string;
    status?: TaskStatuses;
    priority?: TaskPriorities;
    startDate?: string;
    deadline?: string;
};
export type TasksStateType = {
    [key: string]: Array<TaskType>;
};
