import { TableBody, TableHead } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CheckIcon, Cross1Icon, QuestionMarkIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import * as React from "react";
import { useParams } from "react-router-dom";
import useSWR from 'swr';
import { ENDPOINT_URL } from '../../utils/contants';
import { fetcher } from '../../utils/fetcher';
import SelectionButton from "./SelectionButton";

const theme = createTheme();

function makeIcon(x, selections) {
  const selection =
    selections.find((selection) => selection.x === x)?.selection || "unknown";
  switch (selection) {
    case "yes":
      return (
        <Button disabled>
          <CheckIcon style={{
            color: "green",
          }} />
        </Button>
      );
    case "no":
      return (
        <Button disabled>
          <Cross1Icon style={{
            color: 'red',
          }}
          />
        </Button>
      );
    case "unknown":
      return (
        <Button disabled>
          <QuestionMarkIcon />
        </Button>
      );
    default:
      throw new Error(`Unknown selection ${selection}`);
  }
}

export default function Poll() {
  const { id } = useParams();
  const { data: poll, error, isLoading, mutate } = useSWR(`${ENDPOINT_URL}/poll/${id}`, fetcher);
  const [name, setName] = React.useState("");

  if (isLoading) {
    return <>Loading...</>
  }

  if (error) {
    console.error(error);
    return <pre>{JSON.stringify({ error }, null, 2)}</pre>
  }

  if (!poll) {
    return <h1>No poll</h1>
  }

  function handleChange(e) {
    setName(e.target.value);
  }

  const submit = async (event) => {
    event.preventDefault();

    const selections = poll.x.map((x, i) => ({
      x,
      selection: document.getElementById(`selection-${i}`).value || "unknown",
    }));
    const data = { name, selections };
    const url = `${ENDPOINT_URL}/poll/respond/${id}`;

    await axios.post(url, data).catch(console.error);
    mutate()
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            {poll.title}
          </Typography>
          <Typography variant="subtitle1" color="default">
            {poll.description}
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell> {/* empty cell */}
                  {poll.x.map((x, i) => (
                    <TableCell align="center" key={i}>
                      {x}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(poll.responses || []).map(({ name, selections }, i) => (
                  <TableRow key={i}>
                    <TableCell>{name}</TableCell>
                    {poll.x.map((x, i) => (
                      <TableCell key={i}>{makeIcon(x, selections)}</TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <TextField
                      value={name}
                      onChange={handleChange}
                      placeholder="Your name"
                      sx={{ width: "8em" }}
                    ></TextField>
                  </TableCell>
                  {poll.x.map((_x, i) => (
                    <TableCell key={i}>
                      <SelectionButton
                        selection_id={`selection-${i}`}
                        onClick={(e) => console.log(e.message)}
                      ></SelectionButton>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>

            <Button
              onClick={submit}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
