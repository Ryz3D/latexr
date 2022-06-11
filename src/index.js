import './index.css';

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import { Box, Button, ButtonGroup, Card, Checkbox, Divider, FormControlLabel, List, ListItemButton, MenuItem, Modal, Select, Snackbar, TextField, Typography } from '@mui/material';
import { Close, CopyAll, Delete, Download, Restore } from '@mui/icons-material';
import Latex from 'react-latex';
import html2canvas from 'html2canvas';
import { HotKeys } from 'react-hotkeys';

function App() {
  const printRef = useRef();
  const downloadRef = useRef();

  const [text, setText] = useState('');
  const [mathMode, setMathMode] = useState(true);
  const [imgScale, setImgScale] = useState(parseFloat(localStorage.getItem('imgScale') || undefined) || 3);
  const [bgColor, setBgColor] = useState('#ffffff00');
  const [imgType, setImgType] = useState('image/png');
  const [imgQuality, setImgQuality] = useState(92);
  const [downloadURL, setDownloadURL] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [copyBarOpen, setCopyBarOpen] = useState(false);
  const [downloadBarOpen, setDownloadBarOpen] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // const [windowHeight, setWindowHeight] = useState(window.innerWidth);

  const [history, setHistory] = useState([]);

  const hasWindow = window !== undefined;
  useEffect(() => {
    const listener = () => {
      setWindowWidth(hasWindow ? window.innerWidth : 0);
      // setWindowHeight(hasWindow ? window.innerHeight : 0);
    };
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [hasWindow]);

  useEffect(() => {
    if (downloadURL) {
      downloadRef.current.click();
    }
  }, [downloadURL]);

  useEffect(() => {
    localStorage.setItem('imgScale', imgScale.toString());
  }, [imgScale]);

  const latexToName = (latex) => {
    var name = latex;
    name = name.replaceAll('\\', ' ');
    name = name.replaceAll('{', ' ').replaceAll('}', ' ');
    name = name.replaceAll(/\s+/g, ' ');
    return name.slice(0, 25).trim();
  };

  const textEmpty = () => text.trim().length === 0;

  const saveFormula = () => {
    if (!textEmpty() && !history.some(p => p.text === text)) {
      setHistory([{
        text,
        mathMode,
        time: new Date().toLocaleTimeString(),
      }, ...history]);
    }
  };

  const getImg = () => {
    return new Promise(resolve => {
      html2canvas(printRef.current, {
        backgroundColor: bgColor,
        scale: imgScale,
      }).then(canvas => {
        canvas.toBlob(blob => {
          resolve(blob);
        }, imgType, imgQuality / 100);
      });
    });
  };

  const imgCopy = () => {
    getImg().then(blob => {
      navigator.clipboard.write([
        new window.ClipboardItem({
          [imgType]: blob,
        }),
      ]);
    });
    saveFormula();
    setCopyBarOpen(true);
  };

  const imgDownload = () => {
    getImg().then(blob => {
      setDownloadURL(URL.createObjectURL(blob));
    });
    saveFormula();
    setDownloadBarOpen(true);
  };

  const openHistory = () => {
    saveFormula();
    setHistoryOpen(true);
  };

  const formMargin = '12px';

  const canDownload = !textEmpty();
  const canCopy = imgType === 'image/png';

  const keyMap = {
    COPY: 'c',
    DOWNLOAD: 's',
    HISTORY: 'h',
  };
  const keyHandlers = {
    COPY: () => { if (canDownload && canCopy) imgCopy(); },
    DOWNLOAD: () => { if (canDownload) imgDownload(); },
    HISTORY: () => openHistory(),
  };

  return (
    <HotKeys keyMap={keyMap} handlers={keyHandlers}>
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        bottom: '0',
        right: '0',
        overflowY: 'auto',
      }}>
        <Box padding='4vw 7vw'>
          <Card>
            <Box margin='5vw'>
              <TextField fullWidth label='LaTeX Input' value={text}
                multiline onChange={(e) => setText(e.target.value)} />
              <div style={{ height: '10px' }} />

              <Divider />
              <div style={{ height: '10px' }} />

              <div style={{
                display: 'inline-flex',
                overflowX: 'auto',
                width: 'calc(76vw - 16px)',
                backgroundColor: bgColor,
              }}>
                <div ref={printRef} style={{
                  padding: '8px',
                  display: 'inline-flex',
                  fontSize: '1.5rem',
                }}>
                  <Latex>
                    {(mathMode ? '$' : '') + text + (mathMode ? '$' : '')}
                  </Latex>
                </div>
              </div>
              <div style={{ height: '10px' }} />

              <Divider />
              <div style={{ height: '10px' }} />

              <ButtonGroup fullWidth variant='contained'
                orientation={windowWidth < 400 ? 'vertical' : 'horizontal'}>
                <Button startIcon={<CopyAll />} onClick={() => imgCopy()} disabled={!canDownload || !canCopy}>
                  Copy
                </Button>
                <Button startIcon={<Restore />} onClick={() => openHistory()}>
                  History
                </Button>
                <Button startIcon={<Download />} onClick={() => imgDownload()} disabled={!canDownload}>
                  Save
                </Button>
              </ButtonGroup>
              <div style={{ height: '25px' }} />

              <FormControlLabel control={<Checkbox checked={mathMode} onChange={(e, value) => setMathMode(value)} />}
                label='Math mode (Leading/Trailing $)' />
              <div style={{ height: formMargin }} />

              <TextField fullWidth label='Background' value={bgColor}
                onChange={(e) => setBgColor(('#' + (e.target.value || '#').slice(1)).slice(0, 9))} />
              <div style={{ height: formMargin }} />

              <div style={{ display: 'flex' }}>
                <TextField fullWidth label='Image Scale' type='number' value={imgScale * 5}
                  onChange={(e) => setImgScale(Math.min(200, Math.max(1, parseInt(e.target.value))) / 5)} />
                <Button variant='contained' onClick={() => setImgScale(3)}
                  style={{ padding: '0 30px' }}>
                  <Restore />
                  Default
                </Button>
              </div>
              <div style={{ height: formMargin }} />

              <div style={{ display: 'flex' }}>
                <TextField fullWidth label='Image Quality' type='number' value={imgQuality}
                  onChange={(e) => setImgQuality(Math.min(100, Math.max(0, parseInt(e.target.value))))} />
                <Button variant='contained' onClick={() => setImgScale(3)}
                  style={{ padding: '0 30px' }}>
                  <Restore />
                  Default
                </Button>
              </div>
              <div style={{ height: formMargin }} />

              <div style={{ display: 'flex' }}>
                <Typography>
                  Image Format
                </Typography>
                <Select fullWidth value={imgType}
                  onChange={(e) => setImgType(e.target.value)}>
                  {['png', 'jpeg', 'webp'].map((mime, i) =>
                    <MenuItem key={i} value={'image/' + mime}>
                      {mime.toUpperCase()}
                    </MenuItem>
                  )}
                </Select>
              </div>
              <div style={{ height: formMargin }} />

              <Typography variant='body'>
                <i>Hint: See errors in the developer console (Ctrl+Shift+I)</i>
              </Typography>
            </Box>
          </Card>
          <a href={downloadURL} download={latexToName(text) + '.' + imgType.split('/')[1]}
            style={{ display: 'none' }} ref={downloadRef}>
            download
          </a>
        </Box>
      </div>
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <Box margin='10vw'>
          <Card>
            <Box padding='5vw'>
              <Typography variant='h4'>
                History
              </Typography>
              <Divider />
              <List>
                {history.map((e, i) =>
                  <ListItemButton key={i} style={{ display: 'flex', justifyContent: 'space-between' }}
                    onClick={() => { setText(e.text); setMathMode(e.mathMode); setHistoryOpen(false); }}>
                    <div style={{ width: '80%', overflow: 'hidden' }}>
                      <Latex>
                        {(e.mathMode ? '$' : '') + e.text + (e.mathMode ? '$' : '')}
                      </Latex>
                    </div>
                    <Typography variant='body' color='GrayText'>
                      {e.time}
                    </Typography>
                  </ListItemButton>
                )}
              </List>
              <Divider />
              <div style={{ height: '10px' }} />
              <ButtonGroup fullWidth variant='contained'>
                <Button startIcon={<Delete />} disabled={history.length === 0} onClick={() => setHistory([])}>
                  Delete
                </Button>
                <Button startIcon={<Close />} onClick={() => setHistoryOpen(false)}>
                  Close
                </Button>
              </ButtonGroup>
            </Box>
          </Card>
        </Box>
      </Modal>
      <Snackbar open={copyBarOpen} onClose={() => setCopyBarOpen(false)}
        autoHideDuration={1500} message='Image Copied' />
      <Snackbar open={downloadBarOpen} onClose={() => setDownloadBarOpen(false)}
        autoHideDuration={1500} message='Image Saved' />
    </HotKeys>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
