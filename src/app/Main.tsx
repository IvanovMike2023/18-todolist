import Container from "@mui/material/Container"
import {Path} from "common/router"
import {AddItemForm} from "common/components"
import {useAppDispatch, useAppSelector} from "common/hooks"
import {Navigate} from "react-router-dom"
import {Todolists} from "../features/todolists/ui/Todolists/Todolists"
import {useCreateTodolistMutation} from "../features/todolists/api/_todolistsApi";
import {selectIsLoggedIn} from "./appSlice";
import {Grid} from "@mui/material";

export const Main = () => {
    const isLoggedIn = useAppSelector(selectIsLoggedIn)
    const [createtodolist] = useCreateTodolistMutation()
    const addTodolist = (title: string) => {
        createtodolist(title)
    }

    if (!isLoggedIn) {
        return <Navigate to={Path.Login}/>
    }

    return (
        <Container fixed>
            <Grid container sx={{mb: "30px"}}>
                <AddItemForm addItem={addTodolist}/>
            </Grid>
            <Grid container spacing={4}>
                <Todolists/>
            </Grid>
        </Container>
    )
}
