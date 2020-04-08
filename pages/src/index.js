const {
    colors,
    CssBaseline,
    ThemeProvider,
    Typography,
    Container,
    makeStyles,
    createMuiTheme,
    Box,
    SvgIcon,
    Link,
    AppBar,
    Toolbar,
    IconButton,
    Button,
    SwipeableDrawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Grid,
    GridList,
    GridListTile,
    Paper,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Divider
} = MaterialUI;

const { useState, useEffect } = React;

const { HashRouter, Route, Switch } = ReactRouterDOM;

console.log('React ==> ', React);
console.log('ReactRouterDOM ==> ', ReactRouterDOM);
console.log('MaterialUI ==> ', MaterialUI);

let bookmarkList = [];

// Create a theme instance.
const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: colors.red.A400,
        },
        background: {
            default: '#fff',
        },
    },
});

function App() {

    // 显示侧边栏
    const [showDrawer, showDrawerChange] = React.useState(false);

    const useStyles = makeStyles({
        root: {
            marginTop: '100px'
        },
    });

    // let location = ReactRouterDOM.useLocation();
    // let history = ReactRouterDOM.useHistory();

    const classes = useStyles();

    return (
        <Container>
            <AppBar>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => {
                        showDrawerChange(!showDrawer);
                    }}>
                        <i className="material-icons">menu</i>
                    </IconButton >
                    <Typography variant="h6">
                        Home
                    </Typography>
                </Toolbar>
            </AppBar>
            <TemporaryDrawer showDrawer={showDrawer} showDrawerChange={showDrawerChange} />

            <div className={classes.root}>
                <Route path="/markdown" component={MarkdownRoute}></Route>
                <Route path="/bookmark" component={BookmarkRoute}></Route>
            </div>
        </Container>
    );
}

// 侧边栏
function TemporaryDrawer(props) {

    let history = ReactRouterDOM.useHistory();

    const routeJump = (url) => {
        history.push(url);
        props.showDrawerChange(false);
    }

    return (
        <SwipeableDrawer
            open={props.showDrawer}
            onClose={() => { props.showDrawerChange(false) }}
            onOpen={() => { }}
        >
            <List component="nav" aria-label="main mailbox folders">
                <ListItem button onClick={() => { routeJump("/bookmark") }}>
                    <ListItemIcon>
                        <Link to="/bookmark">
                            <i className="material-icons">home</i>
                        </Link>
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem button onClick={() => { routeJump("/markdown") }}>
                    <ListItemIcon>
                        <Link to="/bookmark">
                            <i className="material-icons">note</i>
                        </Link>
                    </ListItemIcon>
                    <ListItemText primary="Markdown" />
                </ListItem>
            </List>
        </SwipeableDrawer>
    );
}

function BookmarkRoute() {

    let [dataList, setDataList] = useState(bookmarkList);

    useEffect(() => {
    });

    const classes = makeStyles({
        root: {},
        header: {
            fontSize: 'medium',
            fontWeight: 'bolder'
        },
        grid: {
            width: '100%',
            cursor: 'pointer'
        },
        card: {
            // width: '100%',
            // height: '160px'
        },
        content: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            paddingTop: '12px'
        },
        action: {
            float: 'right'
        }
    })();

    return (
        <Grid container spacing={2}>
            {
                dataList.map(data => (
                    <Grid onClick={() => { window.open(data.link) }} item key={data._id} xs={12} sm={6} md={4} className={classes.grid}>
                        <Card variant="outlined" className={classes.card}>
                            <CardContent>
                                <Typography variant="h6">
                                    {data.title}
                                    {/* <i className="material-icons md-18">favorite</i> */}
                                </Typography>
                                <div className={classes.content}>{data.remarks}</div>
                            </CardContent>
                            {/* <CardActions disableSpacing className={classes.action}>
                                <IconButton>
                                    <i className="material-icons">arrow_forward_ios</i>
                                </IconButton>
                            </CardActions> */}
                        </Card>
                    </Grid>
                ))
            }
        </Grid>
    )
}

function MarkdownRoute() {

    return (
        <div>
            MarkdownRoute ...
        </div>
    )
}

fetch(`${pageJsonUrl}/Bookmark.json`).then(res => res.json()).then(data => {
    bookmarkList = data;
    render();
});

function render() {
    ReactDOM.render(
        <HashRouter>
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <App />
            </ThemeProvider>
        </HashRouter>,
        document.querySelector('#root'),
    );
}