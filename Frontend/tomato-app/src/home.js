// File: ImageUploadResults.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AppBar, Toolbar, Typography, Avatar, Container, Card, CardContent, CardActionArea,
  CardMedia, Grid, CircularProgress, Paper, Button, Table, TableRow, TableCell, TableBody, TableContainer
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useDropzone } from 'react-dropzone';
import Webcam from "react-webcam";
import cblogo from "./Logo.jpg";
import image from "./toma.jpg";
import axios from "axios";

const useStyles = makeStyles(() => ({
  grow: { flexGrow: 1 },
  root: { maxWidth: 345, flexGrow: 1 },
  media: { height: 400 },
  gridContainer: { justifyContent: "center", padding: "4em 1em 0 1em" },
  mainContainer: {
    position: "relative",
    overflow: "hidden",
    height: "93vh",
    marginTop: "8px",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url(${image})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: "cover",
      filter: "blur(10px)",
      zIndex: 0,
    },
    "& > *": {
      position: "relative",
      zIndex: 1,
    },
  },
  imageCard: {
    margin: "auto",
    maxWidth: "auto",
    height: "auto",
    backgroundColor: "transparent",
    boxShadow: "0px 9px 70px 0px rgb(0 0 0 / 30%) !important",
    borderRadius: "15px",
  },
  imageCardEmpty: { height: "auto" },
  tableContainer: { backgroundColor: "transparent", boxShadow: "none" },
  tableCell: {
    fontSize: "18px",
    backgroundColor: "transparent",
    color: "#000000a6",
    fontWeight: "bolder",
    padding: "8px 16px",
  },
  detail: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  appbar: {
    background: "#be6a77",
    boxShadow: "none",
    color: "white",
  },
  loader: { color: "#be6a77 !important" },
}));

export const ImageUpload = () => {
  const classes = useStyles();
  const webcamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => onSelectFile(acceptedFiles)
  });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
        });
    }
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    handlePrediction(selectedFile);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handlePrediction = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://localhost:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // If API returns an array of results
      const resultData = Array.isArray(response.data) ? response.data : [response.data];
      setResults(resultData);
    } catch (error) {
      console.error("Error during prediction", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setResults([]);
    setSelectedFile(null);
    setPreview(null);
  };

  const onSelectFile = (files) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    } else {
      clearData();
    }
  };

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6">Aurevo Global: Tomato Disease Classification</Typography>
          <div className={classes.grow} />
          <Avatar src={cblogo} />
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} className={classes.mainContainer} disableGutters>
        <Grid container className={classes.gridContainer} spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <Card className={`${classes.imageCard} ${!selectedFile ? classes.imageCardEmpty : ""}`}>
              {!selectedFile ? (
                <CardContent>
                  {!isCameraOpen ? (
                    <>
                      <div
                        {...getRootProps()}
                        style={{
                          border: "2px dashed #ccc",
                          padding: 20,
                          textAlign: "center",
                          cursor: "pointer",
                          borderRadius: 10,
                          backgroundColor: "grey"
                        }}
                      >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                          <Typography>Drop the image here...</Typography>
                        ) : (
                          <Typography>Drag and drop an image of a Tomato plant leaf, or click to select one</Typography>
                        )}
                      </div>
                      <Button variant="contained" color="primary" onClick={() => setIsCameraOpen(true)} style={{ marginTop: "16px" }}>
                        Use Camera
                      </Button>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={350} videoConstraints={{ facingMode: "environment" }} />
                      <div style={{ marginTop: "12px" }}>
                        <Button variant="contained" color="secondary" onClick={capture} style={{ marginRight: "10px" }}>
                          Capture Image
                        </Button>
                        <Button variant="outlined" color="default" onClick={() => setIsCameraOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              ) : (
                <CardActionArea>
                  <CardMedia className={classes.media} image={preview} component="img" title="Uploaded Image" />
                </CardActionArea>
              )}

              {isLoading && (
                <CardContent className={classes.detail}>
                  <CircularProgress color="secondary" className={classes.loader} />
                  <Typography variant="h6">Processing</Typography>
                </CardContent>
              )}

              {results.length > 0 && (
                <CardContent className={classes.detail}>
                  {results.map((result, index) => (
                    <TableContainer component={Paper} className={classes.tableContainer} key={index} style={{ marginBottom: "1em" }}>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell className={classes.tableCell}>Class</TableCell>
                            <TableCell className={classes.tableCell}>{result.predicted_class || "N/A"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={classes.tableCell}>Confidence</TableCell>
                            <TableCell className={classes.tableCell}>{`${result.confidence}%`}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={classes.tableCell}>Solution</TableCell>
                            <TableCell className={classes.tableCell}>
                              {result.solution?.split('\n').map((line, idx) => (
                                <div key={idx}>{line}</div>
                              )) || "N/A"}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ))}
                </CardContent>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};
