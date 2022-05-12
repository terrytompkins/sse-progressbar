import React, { useState } from "react";
import "antd/dist/antd.css";
import { Card, Button, Progress, Row } from "antd";

function ProgressBarComponent() {
  const [fetching, setFetching] = useState(false);
  const [selectedFile, setFiles] = useState(undefined);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [allowUpload, setAllowUpload] = useState(true);

  const handleSelecteFile = (event) => {
    console.log(event);
    setAllowUpload(false);
    setFiles(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("file", selectedFile);
    const serverBaseURL = "http://localhost:8000";
    let url = `${serverBaseURL}/upload/local`;
    // const eventSource = new EventSource("http://localhost:8080/progress");
    let guidValue = null;

  
    const fetchGuid = async () => {
      await fetchEventSource(`${serverBaseURL}/progress`, {
      
      }

      const fetchData = async () => {
        await fetchEventSource(`${serverBaseURL}/progress`, {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
          },
          onopen(res) {
            if (res.ok && res.status === 200) {
              console.log("Connection made ", res);
            } else if (
              res.status >= 400 &&
              res.status < 500 &&
              res.status !== 429
            ) {
              console.log("Client side error ", res);
            }
          },
          onmessage(event) {
            console.log(event.data);
            const parsedData = JSON.parse(event.data);
            setData((data) => [...data, parsedData]);
          },
          onclose() {
            console.log("Connection closed by the server");
          },
          onerror(err) {
            console.log("There was an error from server", err);
          },
        });
      };
      fetchData();
    }
  

    eventSource.addEventListener("GUI_ID", (event) => {
      guidValue = JSON.parse(event.data);
      console.log(`Guid from server: ${guidValue}`);
      data.append("guid", guidValue);
      eventSource.addEventListener(guidValue, (event) => {
        const result = JSON.parse(event.data);
        if (uploadPercentage !== result) {
          setUploadPercentage(result);
        }
        if (result === "100") {
          eventSource.close();
        }
      });
      uploadToServer(url, data);
    });

    eventSource.onerror = (event) => {
      if (event.target.readyState === EventSource.CLOSED) {
        console.log("SSE closed (" + event.target.readyState + ")");
      }
      setUploadPercentage(0);
      eventSource.close();
    };

    eventSource.onopen = () => {
      console.log("connection opened");
    };
  };

  const uploadToServer = (url, data) => {
    setFetching(true);
    console.log("Upload File");
    let currentFile = selectedFile;
    console.log(currentFile);

    const requestOptions = {
      method: "POST",
      mode: "no-cors",
      body: data,
    };
    fetch(url, requestOptions).then(() => setAllowUpload(true));
  };

  return (
    <div>
      <Card title="Live Progress Indicator">
        <Row justify="center">
          <Progress type="circle" percent={(uploadPercentage / 100) * 100} />
        </Row>
        <br></br>
        <Row justify="center">
          {fetching &&
            (uploadPercentage / 100) * 100 !== 100 &&
            `Uploading [${(uploadPercentage / 100) * 100}/100]%`}
          {(uploadPercentage / 100) * 100 === 100 &&
            "File Uploaded Successfully"}
        </Row>
        <br />
        <Row justify="center">
          <form>
            <input type="file" onChange={handleSelecteFile} />
            <Button
              type="primary submit"
              disabled={allowUpload}
              onClick={handleSubmit}
            >
              Upload
            </Button>
          </form>
        </Row>
      </Card>
    </div>
  );
}

export default ProgressBarComponent;
