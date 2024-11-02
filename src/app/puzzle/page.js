"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  TextField,
  DialogTitle,
  Button,
} from "@mui/material";
const generateInitialTileState = (rows, columns) => {
  return Array.from(Array(rows * columns).keys()).map((position) => ({
    correctPosition: position,
    tileHeight: 1 / rows, // 使用百分比表示高度
    tileWidth: 1 / columns, // 使用百分比表示寬度
    tileOffsetX: (position % columns) / columns, // 使用百分比表示X偏移
    tileOffsetY: Math.floor(position / columns) / rows, // 使用百分比表示Y偏移
    currentPosXPerc: Math.random() * (1 - 1 / columns), // 隨機X位置（百分比）
    currentPosYPerc: Math.random() * (1 - 1 / rows), // 隨機Y位置（百分比）
    solved: false,
    connectedTiles: [],
  }));
};
const solveTolerancePercentage = 0.028;
const JigsawPuzzle = ({
  imageSrc,
  rows = 3,
  columns = 4,
  onSolved = () => {},
}) => {
  if (!imageSrc) {
    return null;
  }
  const [tiles, setTiles] = useState();
  const [imageSize, setImageSize] = useState();
  const [rootSize, setRootSize] = useState();
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const rootElement = useRef();
  const resizeObserver = useRef();
  const draggingTile = useRef();
  const [aspectRatio, setAspectRatio] = useState(1);
  const [containerStyle, setContainerStyle] = useState({});
  const [timeCount, setTimeCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let intervalId;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTimeCount((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (imageSize && rootSize) {
      const imgAspectRatio = imageSize.width / imageSize.height;
      const windowAspectRatio = window.innerWidth / window.innerHeight;

      let width, height;

      if (imgAspectRatio > windowAspectRatio) {
        width = "100vw";
        height = `${100 / imgAspectRatio}vw`;
      } else {
        height = "100vh";
        width = `${100 * imgAspectRatio}vh`;
      }

      setContainerStyle({
        width,
        height,
        maxWidth: "100vw",
        maxHeight: "calc(100vh - 60px)",
      });

      setCalculatedHeight(parseFloat(height));
    }
  }, [imageSize, rootSize]);

  useEffect(() => {
    const handleResize = () => {
      if (rootElement.current) {
        const { width, height } = rootElement.current.getBoundingClientRect();
        setRootSize({ width, height });
        if (imageSize) {
          setCalculatedHeight((width / imageSize.width) * imageSize.height);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageSize]);

  const onImageLoaded = useCallback((image) => {
    const imgAspectRatio = image.width / image.height;
    setAspectRatio(imgAspectRatio);
    setImageSize({ width: image.width, height: image.height });
    setTiles(generateInitialTileState(rows, columns));
  }, []);

  const onRootElementResized = useCallback(
    (args) => {
      const contentRect = args.find((it) => it.contentRect)?.contentRect;
      if (contentRect) {
        setRootSize({
          width: contentRect.width,
          height: contentRect.height,
        });
        if (imageSize) {
          setCalculatedHeight(
            (contentRect.width / imageSize.width) * imageSize.height
          );
        }
      }
    },
    [imageSize]
  );

  const onRootElementRendered = useCallback(
    (element) => {
      if (element) {
        rootElement.current = element;
        const observer = new ResizeObserver(onRootElementResized);
        observer.observe(element);
        resizeObserver.current = observer;
        const { width, height } = element.getBoundingClientRect();
        setRootSize({ width, height });
        if (imageSize) {
          setCalculatedHeight((width / imageSize.width) * imageSize.height);
        }
      }
    },
    [onRootElementResized, imageSize]
  );

  useEffect(() => {
    const image = new Image();
    image.onload = () => onImageLoaded(image);
    image.src = imageSrc;
  }, [imageSrc, rows, columns, onImageLoaded]);

  const clamp = (value, min, max) => {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  };

  const onTileMouseDown = useCallback((tile, event) => {
    if (!tile.solved) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type === "touchstart") {
        document.documentElement.style.setProperty("overflow", "hidden");
      }

      const eventPos = {
        x: event.pageX ?? event.touches[0].pageX,
        y: event.pageY ?? event.touches[0].pageY,
      };
      draggingTile.current = {
        tile,
        elem: event.target,
        mouseOffsetX: eventPos.x - event.target.getBoundingClientRect().x,
        mouseOffsetY: eventPos.y - event.target.getBoundingClientRect().y,
      };
      event.target.classList.add("jigsaw-puzzle__piece--dragging");
    }
  }, []);

  const onRootMouseMove = useCallback(
    (event) => {
      if (draggingTile.current && !draggingTile.current.tile.solved) {
        event.stopPropagation();
        event.preventDefault();
        const eventPos = {
          x: event.pageX ?? event.touches[0].pageX,
          y: event.pageY ?? event.touches[0].pageY,
        };
        const draggedToRelativeToRoot = {
          x: clamp(
            eventPos.x -
              rootElement.current.getBoundingClientRect().left -
              draggingTile.current.mouseOffsetX,
            0,
            rootSize.width - draggingTile.current.elem.offsetWidth
          ),
          y: clamp(
            eventPos.y -
              rootElement.current.getBoundingClientRect().top -
              draggingTile.current.mouseOffsetY,
            0,
            rootSize.height - draggingTile.current.elem.offsetHeight
          ),
        };

        const moveTile = (tile, offsetX, offsetY) => {
          const elem = document.querySelector(
            `[data-position="${tile.correctPosition}"]`
          );
          if (elem) {
            elem.style.setProperty(
              "left",
              `${draggedToRelativeToRoot.x + offsetX}px`
            );
            elem.style.setProperty(
              "top",
              `${draggedToRelativeToRoot.y + offsetY}px`
            );
          }
        };

        const moveConnectedTiles = (tile, offsetX, offsetY) => {
          moveTile(tile, offsetX, offsetY);
          tile.connectedTiles.forEach((connectedPos) => {
            const connectedTile = tiles.find(
              (t) => t.correctPosition === connectedPos
            );
            if (connectedTile) {
              const newOffsetX =
                offsetX +
                ((connectedTile.correctPosition % columns) -
                  (tile.correctPosition % columns)) *
                  (rootSize.width / columns);
              const newOffsetY =
                offsetY +
                (Math.floor(connectedTile.correctPosition / columns) -
                  Math.floor(tile.correctPosition / columns)) *
                  (rootSize.height / rows);
              moveConnectedTiles(connectedTile, newOffsetX, newOffsetY);
            }
          });
        };

        moveConnectedTiles(draggingTile.current.tile, 0, 0);
      }
    },
    [rootSize, tiles, columns, rows]
  );

  const onRootMouseUp = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (draggingTile.current) {
        if (event.type === "touchend") {
          document.documentElement.style.removeProperty("overflow");
        }
        draggingTile.current.elem.classList.remove(
          "jigsaw-puzzle__piece--dragging"
        );
        const draggedToPercentage = {
          x: clamp(draggingTile.current.elem.offsetLeft / rootSize.width, 0, 1),
          y: clamp(draggingTile.current.elem.offsetTop / rootSize.height, 0, 1),
        };
        const draggedTile = draggingTile.current.tile;
        const targetPositionPercentage = {
          x: (draggedTile.correctPosition % columns) / columns,
          y: Math.floor(draggedTile.correctPosition / columns) / rows,
        };
        const isSolved =
          Math.abs(targetPositionPercentage.x - draggedToPercentage.x) <=
            solveTolerancePercentage &&
          Math.abs(targetPositionPercentage.y - draggedToPercentage.y) <=
            solveTolerancePercentage;

        setTiles((prevState) => {
          const newState = [...prevState];
          const draggedTileIndex = newState.findIndex(
            (it) => it.correctPosition === draggedTile.correctPosition
          );

          const updatedTile = {
            ...draggedTile,
            currentPosXPerc: isSolved
              ? targetPositionPercentage.x
              : draggedToPercentage.x,
            currentPosYPerc: isSolved
              ? targetPositionPercentage.y
              : draggedToPercentage.y,
            solved: isSolved,
          };

          newState[draggedTileIndex] = updatedTile;
          if (newState.every((tile) => tile.solved)) {
            setIsRunning(false);
            onSolved(timeCount);
          }
          return newState;
        });

        draggingTile.current = undefined;
      }
    },
    [rootSize, columns, rows, onSolved, timeCount]
  );

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div>
      <div
        ref={onRootElementRendered}
        onTouchMove={onRootMouseMove}
        onMouseMove={onRootMouseMove}
        onTouchEnd={onRootMouseUp}
        onMouseUp={onRootMouseUp}
        onTouchCancel={onRootMouseUp}
        onMouseLeave={onRootMouseUp}
        className="jigsaw-puzzle"
        style={{
          ...containerStyle,
          position: "relative",
          margin: "auto",
        }}
        onDragEnter={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
        onDragOver={(event) => {
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        {tiles &&
          rootSize &&
          imageSize &&
          tiles.map((tile) => (
            <div
              draggable={false}
              onMouseDown={(event) => onTileMouseDown(tile, event)}
              onTouchStart={(event) => onTileMouseDown(tile, event)}
              key={tile.correctPosition}
              data-position={tile.correctPosition}
              className={`jigsaw-puzzle__piece ${
                tile.solved ? " jigsaw-puzzle__piece--solved" : ""
              } `}
              style={{
                position: "absolute",
                height: `${(1 / rows) * 100}%`,
                width: `${(1 / columns) * 100}%`,
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: `${rootSize.width}px ${rootSize.height}px`,
                backgroundPositionX: `${
                  ((tile.correctPosition % columns) / (columns - 1)) * 100
                }%`,
                backgroundPositionY: `${
                  (Math.floor(tile.correctPosition / columns) / (rows - 1)) *
                  100
                }%`,
                left: `${tile.currentPosXPerc * rootSize.width}px`,
                top: `${tile.currentPosYPerc * rootSize.height}px`,
              }}
            />
          ))}
      </div>
      <Box fontWeight={700} fontSize={"28px"} p="8px" textAlign={"center"}>
        {formatTime(timeCount)}
      </Box>
    </div>
  );
};

export default function Puzzle() {
  const [openSave, setOpenSave] = useState();
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(100);
  return (
    <Box>
      <JigsawPuzzle
        imageSrc="example.jpg"
        rows={2}
        columns={2}
        onSolved={(time) => {
          setRecord(time);
          setOpenSave(true);
        }}
      />
      <Dialog
        open={openSave}
        onClose={() => {}}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            try {
              setLoading(true);
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const name = formJson.name;

              setOpenSave(false);
            } catch (err) {
              console.log(err);
            } finally {
              setLoading(false);
            }
          },
        }}
      >
        <DialogTitle>恭喜成功 🎉</DialogTitle>
        <DialogContent>
          <DialogContentText mb="16px">
            總共花費 <b style={{ color: "white" }}>{record}</b> 秒,
            留下您的大名或祝福，但要記得名字才能領獎喔！
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            variant="outlined"
            id="name"
            name="name"
            label="名字或祝福"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenSave(false);
            }}
          >
            離開不存
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={loading}
          >
            送出
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
