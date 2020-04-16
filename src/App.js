import tamachiken from './tamachiken.png';
import React from 'react';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import MessageOutlinedIcon from '@material-ui/icons/MessageOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import Container from '@material-ui/core/Container';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { green, lightGreen } from '@material-ui/core/colors';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

function App() {
  // States
  const [showNegative, setShowNegative] = React.useState(false);
  const [requestText, setRequestText] = React.useState("");
  const [yadoId, setYadoId] = React.useState("");
  const [reviewNum, setReviewNum] = React.useState(20);
  const [reviews, setReviews] = React.useState([]);
  const [searching, setSearching] = React.useState(false);

  // Appearance
  const theme = createMuiTheme({
    palette: {
      primary: lightGreen,
      secondary: green,
    }
  });
  const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));
  const classes = useStyles();

  // Event Handler
  function toTableData(yadoId, obj) {
    return {
      "yadoId" : yadoId,
      "reviewId" : obj["id"],
      "review" : obj.sentence,
      "score" : obj.score.toFixed(5),
      "isEvidence" : obj.is_evidence,
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSearching(true);
    fetch('/reviews_by_yado', {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
       body: "yado_id=" + yadoId + "&request=" + requestText + "&review_num=" + reviewNum
//      body: "request=asdfasdfas&yado_id=360504"
     })
       .then(res => res.json())
       .then((data) => data.reviews.map((r) => toTableData(yadoId, r)))
       .then((l) => showNegative ? l : l.filter((e) => e.isEvidence))
       .then((l) => setReviews(l))
       .catch(console.log)
       .finally(() => setSearching(false));
    return;
  }

  return (
    <ThemeProvider theme={theme}>
      {/*  Header */}
      <AppBar position="static">
        <Toolbar>
          <img src={tamachiken} alt="logo" width="40" height="40" style={{marginRight:'10px'}}/>
          <Typography variant="h6">
            根拠判定デモ
          </Typography>
        </Toolbar>
      </AppBar>

      <br/>
      {/*  Search Condition */}
      <Container maxWidth="sm">
        <form className="{classes.root}" noValidate autoComplete="off">
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField id="formRequest" name="formRequest" label="要望" variant="outlined" fullWidth
                onChange={(e) => setRequestText(e.target.value)}/>
            </Grid>
            <Grid item xs={4}>
              <TextField id="formYadoId" name="formYadoId" label="宿ID" variant="outlined"
                onChange={(e) => setYadoId(e.target.value)}/>
            </Grid>
            <Grid item xs={4}>
              <TextField id="formReviewNum" name="formReviewNum" label="取得口コミ数" defaultValue="20" variant="outlined"
                onChange={(e) => setReviewNum(e.target.value)}/>
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={<Checkbox checked={showNegative} onChange={() => setShowNegative(!showNegative)} name="show_nagative" />}
                label="show_nagative"
              />
            </Grid>
          </Grid>
          <br/>
          <Box textAlign="center">
            <SearchOutlinedIcon/>
            <Button variant="contained" color="primary" style={{margin:'auto', textAlign:'center', width: '200px'}}
              onClick={handleSubmit}>
              口コミを探す
            </Button>
          </Box>
        </form>
      </Container>
      <Backdrop className={classes.backdrop} open={searching}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <br/>
      {/*  Search Results */}
      <Container maxWidth="lg">
        <hr/><br/>
        <MessageOutlinedIcon/><Typography display="inline" variant="h6" className="hoge">参考になる口コミ</Typography>
        <br/>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">宿ID</TableCell>
                <TableCell align="center">Review ID</TableCell>
                <TableCell align="center">Review</TableCell>
                <TableCell align="center">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{row.yadoId}</TableCell>
                  <TableCell align="center">{row.reviewId}</TableCell>
                  <TableCell align="left">{row.review}</TableCell>
                  { row.isEvidence ?
                    <TableCell align="center" style={{backgroundColor: '#b3e5fc'}}>{row.score}</TableCell> :
                    <TableCell align="center" style={{backgroundColor: '#DCDCDC'}}>{row.score}</TableCell>
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ThemeProvider>
  );
}

export default App;
