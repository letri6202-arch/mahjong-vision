import React, { useState } from "react";
import { Tooltip } from "react-tooltip";
import client from "../api/client";
import { useRef, useEffect } from "react";

// Styling
import "../styles/HandSubmissionForm2.css";

// Camera capture component
function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");

  // Start camera on mount
  // Modal overlay with video feed and capture button, cancel button, and error message if camera access fails
  //  - On Capture, draw video frame to canvas, convert to blob, and pass blob URL and blob to parent via onCapture callback
  //      - Image is a JPEG image blob created from the canvas, and URL is a blob URL created from that blob for previewing if needed
  //  - On unmount, stop camera stream

  React.useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Could not access camera: " + err.message);
      }
    })();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          onCapture(url, blob);
        }
      }, "image/jpeg");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.8)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        <h3>Capture Mahjong Hand</h3>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: 320,
            height: 240,
            borderRadius: 8,
            background: "#222",
          }}
        />
        <br />
        <button onClick={handleCapture} style={{ margin: 8 }}>
          Capture
        </button>
        <button onClick={onClose} style={{ margin: 8 }}>
          Cancel
        </button>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}

/* Tile Information */
const TILES = [
  "1m",
  "2m",
  "3m",
  "4m",
  "5m",
  "6m",
  "7m",
  "8m",
  "9m",
  "1p",
  "2p",
  "3p",
  "4p",
  "5p",
  "6p",
  "7p",
  "8p",
  "9p",
  "1s",
  "2s",
  "3s",
  "4s",
  "5s",
  "6s",
  "7s",
  "8s",
  "9s",
  "5pr",
  "5mr",
  "5sr",
  "E",
  "S",
  "W",
  "N",
  "C",
  "D",
  "B",
];

// Tiles, grouped by suit
const manTiles = ["1m", "2m", "3m", "4m", "5m", "5mr", "6m", "7m", "8m", "9m"];
const pinTiles = ["1p", "2p", "3p", "4p", "5p", "5pr", "6p", "7p", "8p", "9p"];
const souTiles = ["1s", "2s", "3s", "4s", "5s", "5sr", "6s", "7s", "8s", "9s"];
const honorTiles = ["E", "S", "W", "N", "C", "D", "B"];

const tileImageMap = {
  "1m": "Man1.png",
  "2m": "Man2.png",
  "3m": "Man3.png",
  "4m": "Man4.png",
  "5m": "Man5.png",
  "6m": "Man6.png",
  "7m": "Man7.png",
  "8m": "Man8.png",
  "9m": "Man9.png",
  "1p": "Pin1.png",
  "2p": "Pin2.png",
  "3p": "Pin3.png",
  "4p": "Pin4.png",
  "5p": "Pin5.png",
  "6p": "Pin6.png",
  "7p": "Pin7.png",
  "8p": "Pin8.png",
  "9p": "Pin9.png",
  "1s": "Sou1.png",
  "2s": "Sou2.png",
  "3s": "Sou3.png",
  "4s": "Sou4.png",
  "5s": "Sou5.png",
  "6s": "Sou6.png",
  "7s": "Sou7.png",
  "8s": "Sou8.png",
  "9s": "Sou9.png",
  "5mr": "Man5-Dora.png",
  "5pr": "Pin5-Dora.png",
  "5sr": "Sou5-Dora.png",
  E: "Ton (E).png",
  S: "Nan (S).png",
  W: "Shaa (W).png",
  N: "Pei (N).png",
  C: "Chun (Red Dragon).png",
  D: "Hatsu (Green Dragon).png",
  B: "Haku (White Dragon).png",
};

const fiveCounts = {
  m: 0,
  p: 0,
  s: 0,
};

const yakuDescriptions = {
  Riichi:
    "Declare riichi when tenpai with a closed hand, discarding face-down. Closed only.",
  DaburuRiichi:
    "Riichi declared on your very first discard of the game. Closed only.",
  OpenRiichi:
    "Riichi variant where you reveal your hand. Rare/optional rule. Closed only.",
  DaburuOpenRiichi:
    "Open riichi declared on the first turn. Reveals hand. Closed only.",
  Ippatsu:
    "Win within one full round of turns after declaring riichi, before any calls interrupt.",
  Tsumo: "Win by self-draw with a closed hand. Closed only.",
  Pinfu:
    "Four sequences, a non-yakuhai pair, and a two-sided (ryanmen) wait. Closed only.",
  Tanyao: "All tiles are simples (2–8); no terminals or honors.",
  Iipeiko: "Two identical sequences in a closed hand. Closed only.",
  Ryanpeikou: "Two pairs of identical sequences (double iipeiko). Closed only.",
  Chiitoitsu: "Seven different pairs. Fixed fu of 25. Closed only.",
  Toitoi: "All four melds are triplets; no sequences.",
  "San Ankou":
    "Three concealed triplets. The fourth meld may be open. Closed only.",
  Sanshoku: "Three sequences of the same number across all three suits.",
  SanshokuDoukou: "Three triplets of the same number across all three suits.",
  Ittsu: "A 1–2–3, 4–5–6, and 7–8–9 sequence all in the same suit.",
  Honitsu: "Hand uses only one suit plus honor tiles.",
  Chinitsu: "Hand uses only one suit; no honors.",
  Honroto:
    "All tiles are terminals (1s/9s) or honors, all melds are triplets/pairs. Stacks with Toitoi/Chiitoitsu.",
  Junchan: "Every meld and the pair contain a terminal (1 or 9).",
  Chantai: "Every meld and the pair contain a terminal or honor.",
  Shosangen: "Two triplets of dragon tiles plus a pair of the third dragon.",
  SanKantsu: "Three kans declared in the hand.",
  Haku: "Triplet of white dragons (中).",
  Hatsu: "Triplet of green dragons (發).",
  Chun: "Triplet of red dragons (中).",
  SeatWindEast: "Triplet of your seat wind — East.",
  SeatWindSouth: "Triplet of your seat wind — South.",
  SeatWindWest: "Triplet of your seat wind — West.",
  SeatWindNorth: "Triplet of your seat wind — North.",
  RoundWindEast: "Triplet of the current round wind — East.",
  RoundWindSouth: "Triplet of the current round wind — South.",
  RoundWindWest: "Triplet of the current round wind — West.",
  RoundWindNorth: "Triplet of the current round wind — North.",
  Haitei: "Win by tsumo on the very last drawable tile.",
  Houtei: "Win by ron on the discard after the last drawable tile.",
  Rinshan: "Win by tsumo on the supplemental tile drawn after declaring a kan.",
  Chankan:
    "Win by robbing a kan — stealing the tile someone adds to an open triplet to complete a kan.",
  NagashiMangan:
    "All of your discards were terminals or honors, and none were called. Scored as mangan at round end.",
  Renhou:
    "Win by ron before your first draw (within the first round of turns). *Scored as mangan or yakuman depending on ruleset.",
  "Menzen Tsumo": "Win by self-draw with a closed hand. Closed only.",
  // Add more yaku descriptions as needed
};

// Handler to clear all selected tiles
const handleClearAllTiles = () => {
  setTileCounts({});
  fiveCounts["m"] = 0;
  fiveCounts["p"] = 0;
  fiveCounts["s"] = 0;
};

function HandSubmissionForm2({ playerNames, onHandSubmitted }) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);
  const [processingError, setProcessingError] = useState("");

  // Handler for camera capture
  const handleOpenCamera = () => setShowCamera(true);
  const handleCloseCamera = () => setShowCamera(false);
  // Accepts both URL and Blob
  const handleImageCapture = (imgUrl, blob) => {
    setCapturedImage(imgUrl);
    setCapturedBlob(blob);
    setShowCamera(false);
    setProcessingResult(null);
    setProcessingError("");
  };

  // Upload captured image to backend
  const handleUploadAndProcess = async () => {
    if (!capturedBlob) return;
    setProcessingResult(null);
    setProcessingError("");
    const formData = new FormData();
    formData.append("image", capturedBlob, "capture.jpg");
    try {
      console.log("Uploading image for processing...");
      const response = await fetch("http://localhost:5000/process_image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Processing failed");
      console.log("Processing result:", data);
      setProcessingResult(data);
      console.log(data);
    } catch (err) {
      setProcessingError(err.message);
    }
  };
  // Mute state for audio
  const [isMuted, setIsMuted] = useState(true);
  // Edit mode for manual score editing
  const [editMode, setEditMode] = useState(false);

  // State for Game Controls toggle
  const [showGameControls, setShowGameControls] = useState(true);
  // Generate unique IDs for each player
  const generatePlayerIds = (names) => {
    return names.map((name, idx) => ({
      id: `player-${idx + 1}`,
      name,
      score: 25000,
      riichi: false,
      tenpai: false,
    }));
  };

  const [playerData, setPlayerData] = useState(() =>
    generatePlayerIds(playerNames),
  );

  // Audio ref for Riichi music
  const audioRef = useRef(null);

  useEffect(() => {
    if (!playerData) return;
    const anyRiichi = playerData.some((player) => player.riichi);
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (anyRiichi && !isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [playerData, isMuted]);

  // Track Riichi state for each player
  const [riichiStates, setRiichiStates] = useState(() =>
    playerNames.map(() => false),
  );
  const [isDraw, setIsDraw] = useState(false);

  const [winnerId, setWinnerId] = useState(null);
  // Winning hand info state
  const [winningHandInfo, setWinningHandInfo] = useState(null);
  const [drawHandInfo, setDrawHandInfo] = useState(null);

  //Game State Information
  const [winType, setWinType] = useState("discard");
  const [points, setPoints] = useState("");
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //Tile information
  const [tileCounts, setTileCounts] = useState({});
  const [winningTile, setWinningTile] = useState(null);

  // Meld selection state
  // Each meld is an object: {tiles: [indices], opened: true/false}
  const [kanMelds, setKanMelds] = useState([]); // array of {tiles, opened}
  const [ponMelds, setPonMelds] = useState([]); // array of {tiles, opened}
  const [chiMelds, setChiMelds] = useState([]); // array of {tiles, opened}

  // State for open/closed hand
  const [isHandOpen, setIsHandOpen] = useState(false);

  //Wind selections
  const [playerWind, setPlayerWind] = useState("E"); // Default to East
  const [roundWind, setRoundWind] = useState("E"); // Default to East

  //Variables for additional hand information
  const [isTsumo, setIsTsumo] = useState(false);
  const [isRiichi, setIsRiichi] = useState(false);
  const [isIppatsu, setIsIppatsu] = useState(false);
  const [isRinshan, setIsRinshan] = useState(false);
  const [isChankan, setIsChankan] = useState(false);
  const [isHaitei, setIsHaitei] = useState(false);
  const [isHoutei, setIsHoutei] = useState(false);
  const [isDaburuRiichi, setIsDaburuRiichi] = useState(false);
  const [isNagashiMangan, setIsNagashiMangan] = useState(false);
  const [isTenhou, setIsTenhou] = useState(false);
  const [isRenhou, setIsRenhou] = useState(false);
  const [isChiihou, setIsChiihou] = useState(false);

  //Player information
  const [isDealer, setIsDealer] = useState(false); // This can be determined based on playerWind and roundWind
  const [discardingPlayer, setDiscardingPlayer] = useState(null); // This can be determined based on winType and playerWind
  //Dora indicators
  const [doraIndicators, setDoraIndicators] = useState([]);

  const handleClearAllTiles = () => {
    setTileCounts({});
    setKanMelds([]);
    setPonMelds([]);
    setChiMelds([]);
    setWinningTile(null);
    setDoraIndicators([]);
    fiveCounts.m = 0;
    fiveCounts.p = 0;
    fiveCounts.s = 0;
  };

  const handleTileIncrement = (tile) => {
    setTileCounts((prev) => {
      const current = prev[tile] || 0;
      if (["5mr", "5pr", "5sr"].includes(tile)) {
        if (current < 1) {
          if (tile === "5mr" && fiveCounts["m"] < 4) {
            fiveCounts["m"] = fiveCounts["m"] + 1;
            return { ...prev, [tile]: Math.min(current + 1, 1) };
          } else if (tile === "5pr" && fiveCounts["p"] < 4) {
            fiveCounts["p"] = fiveCounts["p"] + 1;
          } else if (tile === "5sr" && fiveCounts["s"] < 4) {
            fiveCounts["s"] = fiveCounts["s"] + 1;
          }
          return { ...prev, [tile]: Math.min(current + 1, 1) };
        }
      } else if (["5m", "5p", "5s"].includes(tile)) {
        if (current < 4) {
          if (tile === "5m" && fiveCounts["m"] < 4) {
            fiveCounts["m"] = fiveCounts["m"] + 1;
          } else if (tile === "5p" && fiveCounts["p"] < 4) {
            fiveCounts["p"] = fiveCounts["p"] + 1;
          } else if (tile === "5s" && fiveCounts["s"] < 4) {
            fiveCounts["s"] = fiveCounts["s"] + 1;
          }
        }
        return { ...prev, [tile]: Math.min(current + 1, 4) };
      } else if (current < 4) {
        return { ...prev, [tile]: current + 1 };
      }
      return prev;
    });
  };

  const handleTileDecrement = (tile) => {
    setTileCounts((prev) => {
      const current = prev[tile] || 0;
      if (["5mr", "5pr", "5sr"].includes(tile)) {
        if (current > 0) {
          // Decrement the corresponding five count
          if (tile === "5mr" && fiveCounts["m"] > 0) {
            fiveCounts["m"] = Math.max(0, fiveCounts["m"] - 1);
          } else if (tile === "5pr" && fiveCounts["p"] > 0) {
            fiveCounts["p"] = Math.max(0, fiveCounts["p"] - 1);
          } else if (tile === "5sr" && fiveCounts["s"] > 0) {
            fiveCounts["s"] = Math.max(0, fiveCounts["s"] - 1);
          }
          return { ...prev, [tile]: current - 1 };
        }
      } else if (["5m", "5p", "5s"].includes(tile)) {
        if (current > 0) {
          // Decrement the corresponding five count
          if (tile === "5m" && fiveCounts["m"] > 0) {
            fiveCounts["m"] = Math.max(0, fiveCounts["m"] - 1);
          } else if (tile === "5p" && fiveCounts["p"] > 0) {
            fiveCounts["p"] = Math.max(0, fiveCounts["p"] - 1);
          } else if (tile === "5s" && fiveCounts["s"] > 0) {
            fiveCounts["s"] = Math.max(0, fiveCounts["s"] - 1);
          }
          return { ...prev, [tile]: current - 1 };
        }
      } else if (current > 0) {
        return { ...prev, [tile]: current - 1 };
      }
      return prev;
    });
  };

  const getSelectedTiles = () => {
    const tiles = [];

    Object.entries(tileCounts).forEach(([tile, count]) => {
      for (let i = 0; i < count; i++) {
        tiles.push(tile);
      }
    });
    return tiles;
  };

  const getTotalTiles = () => {
    return Object.values(tileCounts).reduce((sum, count) => sum + count, 0);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build melds data for submission
    function buildMeldsData() {
      const tiles = getSelectedTiles();
      const melds = [];
      kanMelds.forEach((meldObj) => {
        if (meldObj.tiles.length === 4) {
          melds.push({
            type: "kan",
            tiles: meldObj.tiles.map((idx) => tiles[idx]),
            opened: meldObj.opened,
          });
        }
      });
      ponMelds.forEach((meldObj) => {
        if (meldObj.tiles.length === 3) {
          melds.push({
            type: "pon",
            tiles: meldObj.tiles.map((idx) => tiles[idx]),
            opened: true,
          });
        }
      });
      chiMelds.forEach((meldObj) => {
        if (meldObj.tiles.length === 3) {
          melds.push({
            type: "chi",
            tiles: meldObj.tiles.map((idx) => tiles[idx]),
            opened: true,
          });
        }
      });
      return melds;
    }

    // Convert melds from indices to tile arrays
    function meldsToTiles(melds, meldSize) {
      const tiles = getSelectedTiles();
      return melds
        .filter((meld) => meld.length === meldSize)
        .map((meld) => meld.map((idx) => tiles[idx]));
    }

    //Define melds in terms of tile arrays
    const ponMeldsTiles = meldsToTiles(ponMelds, 3);
    const chiMeldsTiles = meldsToTiles(chiMelds, 3);
    const kanMeldsTiles = meldsToTiles(kanMelds, 4);

    // Debug print melds
    console.log("pon_meld:", ponMelds);
    console.log("chi_meld:", chiMelds);
    console.log("kan_meld:", kanMelds);

    const tiles = getSelectedTiles();

    // Require a winning tile to submit a hand
    if (!winningTile) {
      setError("Please select a winning tile");
      return;
    }

    //Validate that the winning tile is among the selected tiles
    if (winningTile && !tiles.includes(winningTile)) {
      setError("Winning tile must be among the selected tiles");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const melds_data = buildMeldsData();
      console.log("melds_data:", melds_data);

      const response = await client.post(`/submit_hand`, {
        players: playerData,
        winner_id: winnerId,
        hand_data: {
          tiles: getSelectedTiles(),
          win_type: winType,
          winningTile: winningTile,
          melds_data,
          config: {
            is_tsumo: isTsumo,
            is_riichi: isRiichi,
            is_ippatsu: isIppatsu,
            is_rinshan: isRinshan,
            is_chankan: isChankan,
            is_haitei: isHaitei,
            is_houtei: isHoutei,
            is_daburu_riichi: isDaburuRiichi,
            is_nagashi_mangan: isNagashiMangan,
            is_tenhou: isTenhou,
            is_renhou: isRenhou,
            is_chiihou: isChiihou,
            player_wind: playerWind,
            round_wind: roundWind,
          },
          isDealer: isDealer,
          discarderId: discardingPlayer,
          pon_meld: ponMeldsTiles,
          chi_meld: chiMeldsTiles,
          kan_meld: kanMeldsTiles,
          dora_indicators: doraIndicators,
        },
      });
      // Extract winning hand info from response
      if (response.data && response.data.winning_hand_info) {
        setWinningHandInfo(response.data.winning_hand_info);
        console.log("Winning hand info", winningHandInfo);
      } else {
        setWinningHandInfo(null);
      }
      // Update player scores from response
      if (response.data && response.data.players) {
        setPlayerData(response.data.players);
      }
      onHandSubmitted();
      // Reset all form fields
      setTileCounts({});
      setPoints("");
      setPayments({});
      setWinningTile(null);
      setWinType("discard");
      setPlayerWind("E");
      setRoundWind("E");
      setIsTsumo(false);
      setIsRiichi(false);
      setIsIppatsu(false);
      setIsRinshan(false);
      setIsChankan(false);
      setIsHaitei(false);
      setIsHoutei(false);
      setIsDaburuRiichi(false);
      setIsNagashiMangan(false);
      setIsTenhou(false);
      setIsRenhou(false);
      setIsChiihou(false);
      setIsDealer(isDealer);
      setDiscardingPlayer(null);
      setDoraIndicators([]);
      setWinnerId(null);
      setDoraIndicators([]);
      setPonMelds([]);
      setChiMelds([]);
      setKanMelds([]);
      fiveCounts.m = 0;
      fiveCounts.p = 0;
      fiveCounts.s = 0;
      // Reset all player riichi checkboxes
      setPlayerData((prev) =>
        prev.map((player) => ({ ...player, riichi: false })),
      );
      fiveCounts.s = 0;
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Failed to submit hand";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await client.post(`/submit_draw`, {
        players: playerData,
      });

      if (response.data && response.data.players) {
        setPlayerData(response.data.players);
      }

      // Extract winning hand info from response
      if (response.data && response.data.draw_hand_info) {
        setDrawHandInfo(response.data.draw_hand_info);
        console.log("Draw hand info", drawHandInfo);
      } else {
        setDrawHandInfo(null);
      }
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Failed to submit hand";
      setError(message);
    } finally {
      setLoading(false);
    }
    // Reset all player riichi checkboxes
    setPlayerData((prev) =>
      prev.map((player) => ({ ...player, riichi: false, tenpai: false })),
    );
    setIsDraw(false);
  };
  const handleWinningTile = (tile) => {
    setWinningTile((prev) => (prev === tile ? null : tile));
  };

  return (
    <div className="hand-submission-form">
      {/* Riichi music audio element */}
      <audio ref={audioRef} src="/riichi_music.mp3" loop />
      <audio ref={audioRef} src="/riichi_music.mp3" loop />
      {/* Optional: Uncomment for blurred background effect */}
      {/* <div className="hand-submission-form-background" /> */}

      <div className="hand-submission-container">
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => setShowGameControls((prev) => !prev)}
            style={{
              padding: "6px 16px",
              fontWeight: "bold",
              borderRadius: "6px",
              border: "1px solid #aaa",
              cursor: "pointer",
            }}
          >
            {showGameControls ? "❌" : "⚙️"}
          </button>
        </div>
        {showGameControls && (
          <div className="game-controls-container">
            <div className="form-section">
              <span className="section-label">Game Controls</span>
              <div style={{ marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  style={{
                    padding: "6px 16px",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    border: "1px solid #aaa",
                    background: isMuted ? "#e0e0e0" : "#aee0ae",
                    cursor: "pointer",
                    marginRight: "8px",
                  }}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
              </div>
              {/* Prepopulate Tanyao hand button */}
              <div style={{ marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => {
                    // Tanyao: All simples (2–8), no terminals/honors
                    // Example: 234m 234p 234s 456m 5m (winning tile 5m)
                    setTileCounts({
                      "2m": 3,
                      "4m": 3,
                      "5m": 2,
                      "3p": 1,
                      "4p": 1,
                      "5p": 1,
                      "2s": 1,
                      "3s": 1,
                      "4s": 1,
                    });
                    setWinningTile("5m");
                    setIsTsumo(true);
                    setIsRiichi(false);
                    setIsIppatsu(false);
                    setIsRinshan(false);
                    setIsChankan(false);
                    setIsHaitei(false);
                    setIsHoutei(false);
                    setIsDaburuRiichi(false);
                    setIsNagashiMangan(false);
                    setIsTenhou(false);
                    setIsRenhou(false);
                    setIsChiihou(false);
                    setIsDealer(true);
                    setDiscardingPlayer(null);
                    setDoraIndicators([]);
                    setPlayerWind("E");
                    setRoundWind("E");
                    setWinnerId(
                      playerData && playerData.length > 0
                        ? playerData[0].id
                        : null,
                    );
                  }}
                  style={{
                    padding: "8px 16px",
                    fontWeight: "bold",
                    background: "#e0e0e0",
                    borderRadius: "6px",
                    border: "1px solid #aaa",
                    cursor: "pointer",
                  }}
                >
                  Prepopulate Tanyao Hand (Debugging)
                </button>
              </div>
            </div>
          </div>
        )}
        <h2 className="section-label">Scoreboard</h2>
        <ul>
          {playerData &&
            playerData.map((player, idx) => (
              <li key={idx} className="scoreboard-player-item">
                <span>{player.name}</span>
                <div className="score-edit-row">
                  {editMode && (
                    <button
                      type="button"
                      className="score-edit-btn"
                      onClick={() => {
                        setPlayerData((prev) => {
                          const newData = [...prev];
                          newData[idx] = {
                            ...newData[idx],
                            score: newData[idx].score - 100,
                          };
                          return newData;
                        });
                      }}
                      aria-label="Decrement score"
                    >
                      <img
                        src="/minus-unpressed.png"
                        alt="-"
                        style={{ width: "32px", height: "32px" }}
                      />
                    </button>
                  )}
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.3em",
                      margin: "0 8px",
                    }}
                  >
                    {player.score}
                  </span>
                  {editMode && (
                    <button
                      type="button"
                      className="score-edit-btn"
                      onClick={() => {
                        setPlayerData((prev) => {
                          const newData = [...prev];
                          newData[idx] = {
                            ...newData[idx],
                            score: newData[idx].score + 100,
                          };
                          return newData;
                        });
                      }}
                      aria-label="Increment score"
                    >
                      <img
                        src="/plus-unpressed.png"
                        alt="+"
                        style={{ width: "32px", height: "32px" }}
                      />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className={`open-hand-toggle-btn${player.riichi ? " selected" : ""}`}
                  onClick={() => {
                    setPlayerData((prev) => {
                      const newData = [...prev];
                      if (!newData[idx].riichi) {
                        newData[idx] = {
                          ...newData[idx],
                          riichi: true,
                          score: newData[idx].score - 1000,
                        };
                      } else {
                        newData[idx] = {
                          ...newData[idx],
                          riichi: false,
                          score: newData[idx].score + 1000,
                        };
                      }
                      return newData;
                    });
                  }}
                >
                  Riichi
                </button>
              </li>
            ))}
        </ul>
        {/* Edit mode toggle button */}
        <div style={{ marginTop: "8px" }}>
          <button
            type="button"
            className="edit-mode-toggle-btn"
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? "Save Changes" : "Edit Scores"}
          </button>
        </div>
        <br></br>
        <hr></hr>
        {winningHandInfo && (
          <div className="winning-hand-popup">
            <button
              className="winning-hand-popup-close"
              onClick={() => setWinningHandInfo(null)}
            >
              ×
            </button>
            <div className="winning-hand-popup-content">
              <p className="section-label">Winning Hand Information</p>
              <ul>
                <li>
                  <strong>Han:</strong> {winningHandInfo.han}
                </li>
                {winningHandInfo.fu !== null && (
                  <li>
                    <strong>Fu:</strong> {winningHandInfo.fu}
                  </li>
                )}
                <li>
                  <strong>Points:</strong> {winningHandInfo.points}
                </li>
                <li>
                  <strong>Main Payment:</strong> {winningHandInfo.main}
                </li>
                <li>
                  <strong>Additional Payment:</strong>{" "}
                  {winningHandInfo.additional}
                </li>
                <li>
                  <strong>Yaku:</strong>
                  {winningHandInfo.yaku && winningHandInfo.yaku.length > 0 ? (
                    <ul className="yaku-list">
                      {winningHandInfo.yaku.map((yaku) => (
                        <li key={yaku} className="yaku-item">
                          <strong>{yaku}:</strong>{" "}
                          {yakuDescriptions[yaku] || "No description available"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "None"
                  )}
                </li>
                {winningHandInfo.error && (
                  <li className="error">
                    <strong>Error:</strong> {winningHandInfo.error}
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
        {drawHandInfo && (
          <div className="winning-hand-popup">
            <button
              className="winning-hand-popup-close"
              onClick={() => setDrawHandInfo(null)}
            >
              ×
            </button>
            <div className="winning-hand-popup-content">
              <p className="section-label">Round Results</p>
              <ul>
                <li>
                  <strong>Number of Players in Tenpai:</strong>{" "}
                  {drawHandInfo.num_tenpai}
                </li>
                {drawHandInfo.num_tenpai == 0 && (
                  <li>
                    <strong>
                      No players in tenpai. No points are exchanged.
                    </strong>
                  </li>
                )}
                {drawHandInfo.num_tenpai == 4 && (
                  <li>
                    <strong>
                      All players in tenpai. No points are exchanged.
                    </strong>
                  </li>
                )}
                {drawHandInfo.num_tenpai > 0 && drawHandInfo.num_tenpai < 4 && (
                  <li>
                    <strong>Players in Tenpai:</strong>{" "}
                    {drawHandInfo.tenpai_names.join(", ")}
                  </li>
                )}

                {drawHandInfo.num_tenpai > 0 && drawHandInfo.num_tenpai < 4 && (
                  <li>
                    <strong>Points earned each:</strong>{" "}
                    {drawHandInfo.num_tenpai === 1
                      ? 3000
                      : drawHandInfo.num_tenpai === 2
                        ? 1500
                        : 1000}
                  </li>
                )}

                {drawHandInfo.error && (
                  <li style={{ color: "red" }}>
                    <strong>Error:</strong> {drawHandInfo.error}
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
        {/* Add hand submission UI here */}
        <div className="form-section">
          <label className="section-label">Exhaustive Draw?</label>
          <div className="wind-options">
            <label style={{ marginRight: "16px" }}>
              <input
                type="radio"
                name="is-draw"
                value="yes"
                checked={isDraw === true}
                onChange={() => setIsDraw(true)}
              />
              <span>Yes</span>
            </label>
            <label>
              <input
                type="radio"
                name="is-draw"
                value="no"
                checked={isDraw === false}
                onChange={() => setIsDraw(false)}
              />
              <span>No</span>
            </label>
          </div>
        </div>
        <br></br>
        <hr></hr>
        {isDraw && (
          <form onSubmit={handleDrawSubmit}>
            <div className="form-section">
              <p className="section-label">Who was in tenpai?</p>
              <div className="additional-info">
                {playerData.map((player) => (
                  <label key={player.name} style={{ marginRight: "16px" }}>
                    <input
                      type="checkbox"
                      name={`tenpai-${player.id}`}
                      checked={player.tenpai || false}
                      onChange={(e) => {
                        const updatedPlayerData = playerData.map((p) =>
                          p.id === player.id
                            ? { ...p, tenpai: e.target.checked }
                            : p,
                        );
                        setPlayerData(updatedPlayerData);
                      }}
                    />
                    <span>{player.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="submit-button-container">
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? "Processing..." : "Handle Draw"}
              </button>
            </div>

            {error && <div className="error">{error}</div>}
          </form>
        )}
        {/* All content below controlled by isDraw */}
        {!isDraw && (
          <>
            {/* Camera UI overlay */}
            {showCamera && (
              <CameraCapture
                onCapture={handleImageCapture}
                onClose={handleCloseCamera}
              />
            )}
            {/* Camera capture button and preview, with upload and backend response */}
            <div style={{ marginBottom: 16 }}>
              <button
                type="button"
                onClick={handleOpenCamera}
                style={{
                  padding: "8px 16px",
                  fontWeight: "bold",
                  borderRadius: 6,
                  border: "1px solid #aaa",
                  cursor: "pointer",
                }}
              >
                📷 Capture Mahjong Hand
              </button>
              {capturedImage && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={capturedImage}
                    alt="Captured Mahjong Hand"
                    style={{
                      maxWidth: 320,
                      maxHeight: 240,
                      borderRadius: 8,
                      border: "1px solid #888",
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={handleUploadAndProcess}
                      style={{
                        padding: "6px 16px",
                        fontWeight: "bold",
                        borderRadius: 6,
                        border: "1px solid #4a4",
                        background: "#e0ffe0",
                        cursor: "pointer",
                      }}
                    >
                      ⬆️ Upload & Process
                    </button>
                  </div>
                  {processingResult && (
                    <div style={{ marginTop: 8, color: "#080" }}>
                      <strong>Backend Response:</strong>
                      <pre
                        style={{
                          background: "#f4f4f4",
                          padding: 8,
                          borderRadius: 4,
                        }}
                      >
                        {JSON.stringify(processingResult, null, 2)}
                      </pre>
                    </div>
                  )}
                  {processingError && (
                    <div style={{ marginTop: 8, color: "#a00" }}>
                      <strong>Error:</strong> {processingError}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="form-section">
              <label className="section-label">Select Round Wind</label>
              <div className="wind-options">
                {["E", "S", "W", "N"].map((wind) => (
                  <label key={wind} style={{ marginRight: "16px" }}>
                    <input
                      type="radio"
                      name="round-wind"
                      value={wind}
                      checked={roundWind === wind}
                      onChange={(e) => setRoundWind(e.target.value)}
                    />
                    <span>{wind}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="section-label">Select Winning Player</label>
              <div className="wind-options">
                {playerData.map((player) => (
                  <label key={player.name} style={{ marginRight: "16px" }}>
                    <input
                      type="radio"
                      name="winner-player"
                      value={player.id}
                      checked={winnerId === player.id}
                      onChange={(e) => setWinnerId(e.target.value)}
                    />
                    <span>{player.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="section-label">Was winner the dealer?</label>
            <div className="form-section additional-info">
              <Tooltip id="dealer-tip" place="top" />
              <div className="wind-options">
                <label>
                  <input
                    type="radio"
                    name="is-dealer"
                    checked={isDealer}
                    onChange={() => setIsDealer(true)}
                  />
                  <span>Yes</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="is-dealer"
                    checked={!isDealer}
                    onChange={() => setIsDealer(false)}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
            <div className="form-section">
              <label className="section-label">
                Select Winning Player Wind
              </label>
              <div className="wind-options">
                {["E", "S", "W", "N"].map((wind) => (
                  <label key={wind} style={{ marginRight: "16px" }}>
                    <input
                      type="radio"
                      name="player-wind"
                      value={wind}
                      checked={playerWind === wind}
                      onChange={(e) => setPlayerWind(e.target.value)}
                    />
                    <span>{wind}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="section-label">Win Type</label>
            <div className="wind-options">
              <label>
                <input
                  type="radio"
                  name="win-type"
                  checked={!isTsumo}
                  onChange={() => {
                    setIsTsumo(false);
                  }}
                />
                <span
                  data-tooltip-id="ron-tip"
                  data-tooltip-content="Ron: Win by another player's discard."
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Ron
                </span>
                <Tooltip id="ron-tip" place="top" />
              </label>
              <label>
                <input
                  type="radio"
                  name="win-type"
                  checked={isTsumo}
                  onChange={() => {
                    setIsTsumo(true);
                    setDiscardingPlayer(null);
                  }}
                />
                <span
                  data-tooltip-id="tsumo-tip"
                  data-tooltip-content="Tsumo: Win by self-draw. You draw the winning tile yourself."
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Tsumo (Self-Draw)
                </span>
                <Tooltip id="tsumo-tip" place="top" />
              </label>
            </div>

            {!isTsumo && (
              <div className="discarding-player-select">
                <label className="section-label">Player Who Discarded</label>
                <div className="wind-options">
                  {playerData.map((player) => (
                    <label key={player.name}>
                      <input
                        type="radio"
                        name="discarding-player"
                        value={player.id}
                        checked={discardingPlayer === player.id}
                        onChange={(e) => setDiscardingPlayer(e.target.value)}
                      />
                      <span>{player.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <br></br>
            <hr></hr>
            <h3 className="section-label">Submit Winning Hand</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <p className="subsection-label">
                  Select the tiles of the winning hand
                </p>
                <div className="tile-row-container">
                  <div className="tile-row">
                    <span className="tile-row-label">Man</span>
                    {manTiles.map((tile) => {
                      const count = tileCounts[tile] || 0;
                      const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                      return (
                        <div className="tile-counter" key={tile}>
                          <div className="tile-display">
                            <img
                              src={imagePath}
                              alt={tile}
                              className="tile-image"
                            />
                            <span className="tile-count">{count}</span>
                          </div>
                          <div className="tile-buttons">
                            <button
                              type="button"
                              className="tile-minus"
                              onClick={() => handleTileDecrement(tile)}
                              disabled={count === 0}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                              }}
                            >
                              <img
                                src="/minus-unpressed.png"
                                alt="-"
                                style={{ width: 24, height: 24 }}
                              />
                            </button>
                            <button
                              type="button"
                              className="tile-plus"
                              onClick={() => handleTileIncrement(tile)}
                              disabled={
                                count === 4 ||
                                (["5mr"].includes(tile) && count === 1) ||
                                (["5mr"].includes(tile) &&
                                  fiveCounts[tile[1]] === 4) ||
                                (tile === "5m" && fiveCounts[tile[1]] === 4)
                              }
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                              }}
                            >
                              <img
                                src="/plus-unpressed.png"
                                alt="+"
                                style={{ width: 24, height: 24 }}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="tile-row">
                    <span className="tile-row-label">Pin</span>
                    {pinTiles.map((tile) => {
                      const count = tileCounts[tile] || 0;
                      const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                      return (
                        <div className="tile-counter" key={tile}>
                          <div className="tile-display">
                            <img
                              src={imagePath}
                              alt={tile}
                              className="tile-image"
                            />
                            <span className="tile-count">{count}</span>
                          </div>
                          <div className="tile-buttons">
                            <button
                              type="button"
                              className="tile-minus"
                              onClick={() => handleTileDecrement(tile)}
                              disabled={count === 0}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                              }}
                            >
                              <img
                                src="/minus-unpressed.png"
                                alt="-"
                                style={{ width: 24, height: 24 }}
                              />
                            </button>
                            <button
                              type="button"
                              className="tile-plus"
                              onClick={() => handleTileIncrement(tile)}
                              disabled={
                                count === 4 ||
                                (["5pr"].includes(tile) && count === 1) ||
                                (["5pr"].includes(tile) &&
                                  fiveCounts[tile[1]] === 4) ||
                                (tile === "5p" && fiveCounts[tile[1]] === 4)
                              }
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                              }}
                            >
                              <img
                                src="/plus-unpressed.png"
                                alt="+"
                                style={{ width: 24, height: 24 }}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="tile-row">
                    <span className="tile-row-label">Sou</span>
                    {souTiles.map((tile) => {
                      const count = tileCounts[tile] || 0;
                      const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                      return (
                        <div className="tile-counter" key={tile}>
                          <div className="tile-display">
                            <img
                              src={imagePath}
                              alt={tile}
                              className="tile-image"
                            />
                            <span className="tile-count">{count}</span>
                          </div>
                          <div className="tile-buttons">
                            <button
                              type="button"
                              className="tile-minus"
                              onClick={() => handleTileDecrement(tile)}
                              disabled={count === 0}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                              }}
                            >
                              <img
                                src="/minus-unpressed.png"
                                alt="-"
                                style={{ width: 24, height: 24 }}
                              />
                            </button>
                            <button
                              type="button"
                              className="tile-plus"
                              onClick={() => handleTileIncrement(tile)}
                              disabled={
                                count === 4 ||
                                (["5sr"].includes(tile) && count === 1) ||
                                (["5sr"].includes(tile) &&
                                  fiveCounts[tile[1]] === 4) ||
                                (tile === "5s" && fiveCounts[tile[1]] === 4)
                              }
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                              }}
                            >
                              <img
                                src="/plus-unpressed.png"
                                alt="+"
                                style={{ width: 24, height: 24 }}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="tile-row">
                    <span className="tile-row-label">Honors</span>
                    {honorTiles.map((tile) => {
                      const count = tileCounts[tile] || 0;
                      const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                      return (
                        <div className="tile-counter" key={tile}>
                          <div className="tile-display">
                            <img
                              src={imagePath}
                              alt={tile}
                              className="tile-image"
                            />
                            <span className="tile-count">{count}</span>
                          </div>
                          <div className="tile-buttons">
                            <button
                              type="button"
                              className="tile-minus"
                              onClick={() => handleTileDecrement(tile)}
                              disabled={count === 0}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                              }}
                            >
                              <img
                                src="/minus-unpressed.png"
                                alt="-"
                                style={{ width: 24, height: 24 }}
                              />
                            </button>
                            <button
                              type="button"
                              className="tile-plus"
                              onClick={() => handleTileIncrement(tile)}
                              disabled={count === 4}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                              }}
                            >
                              <img
                                src="/plus-unpressed.png"
                                alt="+"
                                style={{ width: 24, height: 24 }}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <br></br>

                <div className="tile-summary">
                  <label className="subsection-label">Selected Tiles</label>
                  {getSelectedTiles().length <= 0 && (
                    <p className="no-tiles">No tiles selected</p>
                  )}
                  <p className="selected-tiles">
                    Total tiles: {getTotalTiles()}
                  </p>
                  <div className="tile-summary-selected">
                    {getSelectedTiles().map((tile, index) => {
                      return (
                        <img
                          key={index}
                          src={`/Tile_PNGs/${tileImageMap[tile]}`}
                          alt={tile}
                          className="tile-image-selected"
                          onClick={() => handleTileDecrement(tile)}
                        />
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  className="clear-tiles-btn"
                  onClick={handleClearAllTiles}
                  style={{
                    margin: "16px 0",
                    background: "#da7878",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontFamily: "Caveat, cursive",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    padding: "8px 18px",
                    cursor: "pointer",
                    transition:
                      "background 0.2s, box-shadow 0.2s, transform 0.1s",
                  }}
                >
                  Clear All Tiles
                </button>
                <br></br>
                <hr></hr>
                <label className="section-label">Open or Closed Hand?</label>
                <div className="additional-info">
                  <div className="wind-options">
                    <button
                      type="button"
                      className={`open-hand-toggle-btn${isHandOpen ? " selected" : ""}`}
                      onClick={() => {
                        setIsHandOpen(true);
                      }}
                      data-tooltip-id="hand-open-tip"
                      data-tooltip-content="Any of your melds are open/exposed"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className={`open-hand-toggle-btn${!isHandOpen ? " selected" : ""}`}
                      onClick={() => {
                        setIsHandOpen(false);
                        setPonMelds([]);
                        setChiMelds([]);
                        setKanMelds([]);
                      }}
                      data-tooltip-id="hand-closed-tip"
                      data-tooltip-content="All melds are concealed"
                    >
                      Closed
                    </button>
                    <Tooltip id="hand-open-tip" place="top" />
                    <Tooltip id="hand-closed-tip" place="top" />
                  </div>

                  {isHandOpen && (
                    <div className="meld-container">
                      <p className="subsection-label">Input the open melds</p>
                      {/* Kan melds selector (moved above) */}

                      {/* Pon melds selector */}

                      <label>Pon Melds:</label>
                      <div className="meld-row">
                        {ponMelds.map((meldObj, meldIdx) => (
                          <div
                            key={meldIdx}
                            className="tiles-row meld-tiles-row meld-options"
                          >
                            <div className="">
                              <button
                                type="button"
                                className="kan-meld-delete-button"
                                onClick={() =>
                                  setPonMelds(
                                    ponMelds.filter((_, i) => i !== meldIdx),
                                  )
                                }
                                title="Delete Pon Meld"
                              >
                                x
                              </button>
                            </div>
                            {/* Pon tile selection */}
                            <div style={{ display: "flex" }}>
                              {meldObj.tiles.length < 3 ? (
                                <div style={{ display: "inline-block" }}>
                                  {getSelectedTiles().map((tile, idx) => {
                                    const allSelectedIndices = [
                                      ...ponMelds.flatMap((m) => m.tiles),
                                      ...chiMelds.flatMap((m) => m.tiles),
                                      ...kanMelds.flatMap((m) => m.tiles),
                                    ];
                                    const alreadySelected =
                                      meldObj.tiles.includes(idx);
                                    const globallySelected =
                                      allSelectedIndices.includes(idx) &&
                                      !alreadySelected;
                                    const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                                    return (
                                      <div
                                        key={
                                          tile +
                                          "-pon-select-" +
                                          meldIdx +
                                          "-" +
                                          idx
                                        }
                                        className={`tile-counter ${alreadySelected || globallySelected ? "winning-tile-selected" : ""}`}
                                        style={{
                                          display: "inline-block",
                                          cursor:
                                            alreadySelected || globallySelected
                                              ? "not-allowed"
                                              : "pointer",
                                          opacity:
                                            alreadySelected || globallySelected
                                              ? 0.5
                                              : 1,
                                        }}
                                        onClick={() => {
                                          if (
                                            !alreadySelected &&
                                            !globallySelected &&
                                            meldObj.tiles.length < 3
                                          ) {
                                            setPonMelds(
                                              ponMelds.map((m, i) =>
                                                i === meldIdx
                                                  ? {
                                                      ...m,
                                                      tiles: [...m.tiles, idx],
                                                      opened: true,
                                                    }
                                                  : m,
                                              ),
                                            );
                                          }
                                        }}
                                      >
                                        <img
                                          src={imagePath}
                                          alt={tile}
                                          className="tile-image"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                meldObj.tiles.map((idx, tileIdx) => {
                                  const tile = getSelectedTiles()[idx];
                                  const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                                  return (
                                    <div
                                      key={
                                        tile + "-pon-" + meldIdx + "-" + tileIdx
                                      }
                                      className="tile-counter"
                                    >
                                      <img
                                        src={imagePath}
                                        alt={tile}
                                        className="tile-image"
                                      />
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="meld-add-button"
                          onClick={() =>
                            setPonMelds([
                              ...ponMelds,
                              { tiles: [], opened: true },
                            ])
                          }
                        >
                          + Add Pon Meld
                        </button>
                      </div>
                      {/* Chi melds selector */}
                      <hr></hr>
                      <label>Chi Melds:</label>
                      <div className="meld-row">
                        {chiMelds.map((meldObj, meldIdx) => (
                          <div
                            key={meldIdx}
                            className="tiles-row meld-tiles-row"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                              padding: "6px",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                              background: "#f9f9f9",
                              marginBottom: "8px",
                              position: "relative",
                            }}
                          >
                            <div className="kan-open-toggle-group">
                              <button
                                type="button"
                                className="kan-meld-delete-button"
                                onClick={() =>
                                  setChiMelds(
                                    chiMelds.filter((_, i) => i !== meldIdx),
                                  )
                                }
                                title="Delete Chi Meld"
                              >
                                x
                              </button>
                            </div>
                            {/* Chi tile selection */}
                            <div style={{ display: "flex" }}>
                              {meldObj.tiles.length < 3 ? (
                                <div style={{ display: "inline-block" }}>
                                  {getSelectedTiles().map((tile, idx) => {
                                    const allSelectedIndices = [
                                      ...ponMelds.flatMap((m) => m.tiles),
                                      ...chiMelds.flatMap((m) => m.tiles),
                                      ...kanMelds.flatMap((m) => m.tiles),
                                    ];
                                    const alreadySelected =
                                      meldObj.tiles.includes(idx);
                                    const globallySelected =
                                      allSelectedIndices.includes(idx) &&
                                      !alreadySelected;
                                    const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                                    return (
                                      <div
                                        key={
                                          tile +
                                          "-chi-select-" +
                                          meldIdx +
                                          "-" +
                                          idx
                                        }
                                        className={`tile-counter ${alreadySelected || globallySelected ? "winning-tile-selected" : ""}`}
                                        style={{
                                          display: "inline-block",
                                          cursor:
                                            alreadySelected || globallySelected
                                              ? "not-allowed"
                                              : "pointer",
                                          opacity:
                                            alreadySelected || globallySelected
                                              ? 0.5
                                              : 1,
                                        }}
                                        onClick={() => {
                                          if (
                                            !alreadySelected &&
                                            !globallySelected &&
                                            meldObj.tiles.length < 3
                                          ) {
                                            setChiMelds(
                                              chiMelds.map((m, i) =>
                                                i === meldIdx
                                                  ? {
                                                      ...m,
                                                      tiles: [...m.tiles, idx],
                                                      opened: true,
                                                    }
                                                  : m,
                                              ),
                                            );
                                          }
                                        }}
                                      >
                                        <img
                                          src={imagePath}
                                          alt={tile}
                                          className="tile-image"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                meldObj.tiles.map((idx, tileIdx) => {
                                  const tile = getSelectedTiles()[idx];
                                  const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                                  return (
                                    <div
                                      key={
                                        tile + "-chi-" + meldIdx + "-" + tileIdx
                                      }
                                      className="tile-counter"
                                    >
                                      <img
                                        src={imagePath}
                                        alt={tile}
                                        className="tile-image"
                                      />
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="meld-add-button"
                          onClick={() =>
                            setChiMelds([
                              ...chiMelds,
                              { tiles: [], opened: true },
                            ])
                          }
                        >
                          + Add Chi Meld
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <br></br>
                <hr></hr>
                <div className="form-section">
                  <div className="meld-row">
                    <label className="section-label">Enter Any Kans</label>
                    {/* <label>Kan Melds:</label>
                    <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>
                      Melds: {JSON.stringify(kanMelds)}
                    </div> */}
                    {kanMelds.map((meldObj, meldIdx) => (
                      <div
                        key={meldIdx}
                        className="tiles-row meld-tiles-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          overflowX: "auto",
                          whiteSpace: "nowrap",
                          padding: "6px",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          background: "#f9f9f9",
                          marginBottom: "8px",
                          position: "relative",
                        }}
                      >
                        {/* Open/close selector for Kan meld, left side, styled like suit label */}
                        <div className="kan-open-toggle-group">
                          <button
                            type="button"
                            className="kan-meld-delete-button"
                            onClick={() =>
                              setKanMelds(
                                kanMelds.filter((_, i) => i !== meldIdx),
                              )
                            }
                            title="Delete Kan Meld"
                          >
                            x
                          </button>
                          <button
                            type="button"
                            className={`kan-open-toggle-btn${meldObj.opened ? " selected" : ""}`}
                            onClick={() =>
                              setKanMelds(
                                kanMelds.map((m, i) =>
                                  i === meldIdx ? { ...m, opened: true } : m,
                                ),
                              )
                            }
                          >
                            Open Kan
                          </button>
                          <button
                            type="button"
                            className={`kan-open-toggle-btn${!meldObj.opened ? " selected" : ""}`}
                            onClick={() =>
                              setKanMelds(
                                kanMelds.map((m, i) =>
                                  i === meldIdx ? { ...m, opened: false } : m,
                                ),
                              )
                            }
                          >
                            Closed Kan
                          </button>
                        </div>
                        {/* Kan tile selection */}
                        <div className="kan-meld-tiles-row">
                          {meldObj.tiles.length < 4
                            ? getSelectedTiles().map((tile, idx) => {
                                const allSelectedIndices = [
                                  ...ponMelds.flatMap((m) => m.tiles),
                                  ...chiMelds.flatMap((m) => m.tiles),
                                  ...kanMelds.flatMap((m) => m.tiles),
                                ];
                                const alreadySelected =
                                  meldObj.tiles.includes(idx);
                                const globallySelected =
                                  allSelectedIndices.includes(idx) &&
                                  !alreadySelected;
                                const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                                return (
                                  <div
                                    key={
                                      tile +
                                      "-kan-select-" +
                                      meldIdx +
                                      "-" +
                                      idx
                                    }
                                    className={`tile-counter ${alreadySelected || globallySelected ? "winning-tile-selected" : ""}`}
                                    style={{
                                      cursor:
                                        alreadySelected || globallySelected
                                          ? "not-allowed"
                                          : "pointer",
                                      opacity:
                                        alreadySelected || globallySelected
                                          ? 0.5
                                          : 1,
                                    }}
                                    onClick={() => {
                                      if (
                                        !alreadySelected &&
                                        !globallySelected &&
                                        meldObj.tiles.length < 4
                                      ) {
                                        setKanMelds(
                                          kanMelds.map((m, i) =>
                                            i === meldIdx
                                              ? {
                                                  ...m,
                                                  tiles: [...m.tiles, idx],
                                                }
                                              : m,
                                          ),
                                        );
                                      }
                                    }}
                                  >
                                    <img
                                      src={imagePath}
                                      alt={tile}
                                      className="tile-image"
                                    />
                                  </div>
                                );
                              })
                            : meldObj.tiles.map((idx, tileIdx) => {
                                const tile = getSelectedTiles()[idx];
                                const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                                return (
                                  <div
                                    key={
                                      tile + "-kan-" + meldIdx + "-" + tileIdx
                                    }
                                    className="tile-counter"
                                  >
                                    <img
                                      src={imagePath}
                                      alt={tile}
                                      className="tile-image"
                                    />
                                  </div>
                                );
                              })}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="meld-add-button"
                      onClick={() =>
                        setKanMelds([...kanMelds, { tiles: [], opened: false }])
                      }
                    >
                      + Add Kan Meld
                    </button>
                  </div>
                </div>
                <br></br>
                <hr></hr>
                <div className="form-section">
                  <p className="section-label">Select the winning tile</p>
                  {getSelectedTiles().length > 0 && (
                    <div className="tiles-row">
                      {[...new Set(getSelectedTiles())].map((tile, index) => {
                        const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                        const isSelected = winningTile === tile;
                        return (
                          <div
                            key={tile}
                            className={`tile-counter ${isSelected ? "winning-tile-selected" : ""}`}
                            onClick={() => handleWinningTile(tile)}
                            style={{ cursor: "pointer" }}
                          >
                            <img
                              src={imagePath}
                              alt={tile}
                              className="tile-image"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="subsection-label">Winning Tile </p>

                  {!winningTile && (
                    <p className="no-winning-tile">No winning tile selected</p>
                  )}

                  {winningTile && (
                    <div className="winning-tile-display">
                      <p>Selected: {winningTile}</p>
                      <img
                        src={`/Tile_PNGs/${tileImageMap[winningTile]}`}
                        alt={winningTile}
                        className="tile-image"
                      />
                    </div>
                  )}
                  <hr></hr>
                  <div className="form-section">
                    <label className="section-label">Basic Options</label>
                    <div className="additional-info">
                      <label>
                        <input
                          type="checkbox"
                          checked={isRiichi}
                          onChange={(e) => setIsRiichi(e.target.checked)}
                          data-tooltip-id="riichi-tip"
                          data-tooltip-content="Declare ready hand, waiting for one tile to win."
                        />
                        <span
                          data-tooltip-id="riichi-tip"
                          data-tooltip-content="Declare ready hand, waiting for one tile to win."
                        >
                          Riichi
                        </span>
                        <Tooltip id="riichi-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isIppatsu}
                          onChange={(e) => setIsIppatsu(e.target.checked)}
                          data-tooltip-id="ippatsu-tip"
                          data-tooltip-content="Win within one turn after declaring Riichi."
                        />
                        <span
                          data-tooltip-id="ippatsu-tip"
                          data-tooltip-content="Win within one turn after declaring Riichi."
                        >
                          Ippatsu
                        </span>
                        <Tooltip id="ippatsu-tip" place="top" />
                      </label>
                    </div>
                    <label className="section-label">Advanced Options</label>
                    <div className="additional-info">
                      <label>
                        <input
                          type="checkbox"
                          checked={isRinshan}
                          onChange={(e) => setIsRinshan(e.target.checked)}
                          data-tooltip-id="rinshan-tip"
                          data-tooltip-content="Win by drawing a tile after a Kan (quad)."
                        />
                        <span
                          data-tooltip-id="rinshan-tip"
                          data-tooltip-content="Win by drawing a tile after a Kan (quad)."
                        >
                          Rinshan
                        </span>
                        <Tooltip id="rinshan-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isChankan}
                          onChange={(e) => setIsChankan(e.target.checked)}
                          data-tooltip-id="chankan-tip"
                          data-tooltip-content="Win by robbing a Kan (quad)."
                        />
                        <span
                          data-tooltip-id="chankan-tip"
                          data-tooltip-content="Win by robbing a Kan (quad)."
                        >
                          Chankan
                        </span>
                        <Tooltip id="chankan-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isHaitei}
                          onChange={(e) => setIsHaitei(e.target.checked)}
                          data-tooltip-id="haitei-tip"
                          data-tooltip-content="Win with the last tile drawn from the wall."
                        />
                        <span
                          data-tooltip-id="haitei-tip"
                          data-tooltip-content="Win with the last tile drawn from the wall."
                        >
                          Haitei
                        </span>
                        <Tooltip id="haitei-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isHoutei}
                          onChange={(e) => setIsHoutei(e.target.checked)}
                          data-tooltip-id="houtei-tip"
                          data-tooltip-content="Win with the last discard."
                        />
                        <span
                          data-tooltip-id="houtei-tip"
                          data-tooltip-content="Win with the last discard."
                        >
                          Houtei
                        </span>
                        <Tooltip id="houtei-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isDaburuRiichi}
                          onChange={(e) => setIsDaburuRiichi(e.target.checked)}
                          data-tooltip-id="dabururiichi-tip"
                          data-tooltip-content="Double Riichi: declare Riichi on your first turn."
                        />
                        <span
                          data-tooltip-id="dabururiichi-tip"
                          data-tooltip-content="Double Riichi: declare Riichi on your first turn."
                        >
                          Daburu Riichi
                        </span>
                        <Tooltip id="dabururiichi-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isNagashiMangan}
                          onChange={(e) => setIsNagashiMangan(e.target.checked)}
                          data-tooltip-id="nagashi-tip"
                          data-tooltip-content="Win by only discarding terminals and honors."
                        />
                        <span
                          data-tooltip-id="nagashi-tip"
                          data-tooltip-content="Win by only discarding terminals and honors."
                        >
                          Nagashi Mangan
                        </span>
                        <Tooltip id="nagashi-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isTenhou}
                          onChange={(e) => setIsTenhou(e.target.checked)}
                          data-tooltip-id="tenhou-tip"
                          data-tooltip-content="Dealer wins on the first turn."
                        />
                        <span
                          data-tooltip-id="tenhou-tip"
                          data-tooltip-content="Dealer wins on the first turn."
                        >
                          Tenhou
                        </span>
                        <Tooltip id="tenhou-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isRenhou}
                          onChange={(e) => setIsRenhou(e.target.checked)}
                          data-tooltip-id="renhou-tip"
                          data-tooltip-content="Non-dealer wins on the first turn."
                        />
                        <span
                          data-tooltip-id="renhou-tip"
                          data-tooltip-content="Non-dealer wins on the first turn."
                        >
                          Renhou
                        </span>
                        <Tooltip id="renhou-tip" place="top" />
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={isChiihou}
                          onChange={(e) => setIsChiihou(e.target.checked)}
                          data-tooltip-id="chiihou-tip"
                          data-tooltip-content="Non-dealer self-draw win on the first turn."
                        />
                        <span
                          data-tooltip-id="chiihou-tip"
                          data-tooltip-content="Non-dealer self-draw win on the first turn."
                        >
                          Chiihou
                        </span>
                        <Tooltip id="chiihou-tip" place="top" />
                      </label>
                    </div>

                    {/* Dora tile selection section */}
                    <div className="form-section">
                      <label className="section-label">Dora Tiles</label>
                      <p className="subsection-label">Select the Dora Tiles</p>
                      <div className="tiles-row">
                        {TILES.map((tile) => {
                          const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                          const isSelected = doraIndicators.includes(tile);
                          return (
                            <div
                              key={tile}
                              className={`tile-counter dora-tile-select ${isSelected ? "dora-tile-selected" : ""}`}
                              onClick={() => {
                                setDoraIndicators((prev) =>
                                  isSelected
                                    ? prev.filter((t) => t !== tile)
                                    : [...prev, tile],
                                );
                              }}
                              style={{ cursor: "pointer", margin: "4px" }}
                            >
                              <img
                                src={imagePath}
                                alt={tile}
                                className="tile-image"
                              />
                              {isSelected && (
                                <span className="dora-tile-badge">✓</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p>doraIndicators: {doraIndicators.join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="submit-button-container">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? "Submitting..." : "Submit Hand"}
                </button>
              </div>

              {error && <div className="error">{error}</div>}
            </form>
          </>
        )}{" "}
        {/* End of form rendering when isDraw is false */}
      </div>
    </div>
  );
}

export default HandSubmissionForm2;