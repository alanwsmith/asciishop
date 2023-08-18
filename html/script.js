let s = {
  current: {
    row: null,
    col: null
  },
  selected: {
    row: null,
    col: null,
  },
  freqChars: [],
}

let d = {}

const addRow = () => {
  console.log("adding row")
  d.layers.forEach((layer) => {
    const newRow = []
    for (let x = 0; x < colCount(); x ++) {
      newRow.push({ char: "", hex_color: "#aa00aa" })
    }
    layer.rows.push(newRow)
  })
  buildCanvas()
}
 

const colCount = () => {
  let cols = 0
  d.layers.forEach((layer) => {
    layer.rows.forEach((row) => {
      cols = Math.max(cols, row.length)
    })
  })
  return cols
}

const duplicateLayer = () => {
  if (d.layers[d.metadata.currentLayer] !== undefined) {
    const newLayer = JSON.parse(JSON.stringify(d.layers[d.metadata.currentLayer]))
    d.layers.splice(d.metadata.currentLayer + 1, 0, newLayer)
    d.metadata.currentLayer = d.metadata.currentLayer + 1
    render()
  }
}

const handleCanvasClick = (event) => {
  const data = event.srcElement.dataset
  if (event.shiftKey === true) {
    s.selected.row = s.current.row
    s.selected.col = s.current.col
  } else {
    s.selected.row = null
    s.selected.col = null
  }
  s.current.row = parseInt(data.row)
  s.current.col = parseInt(data.col)
  updateStyles()
}

const handleCharClick = (event) => {
  const char = event.srcElement.innerText
  // add cells if necessary, otherwise update existing ones
  if (!d.layers[d.metadata.currentLayer].rows[s.current.row][s.current.col]) {
    d.layers[d.metadata.currentLayer].rows[s.current.row][s.current.col] = {char: char, hex_color: "aa00aa"}
  } else {
    d.layers[d.metadata.currentLayer].rows[s.current.row][s.current.col].char = char
  }
  if (!s.freqChars.includes(char)) {
    s.freqChars.push(char)
  }
  updateOtherCharacters(event.srcElement.innerText)
  render()
}

const isPixelSelected = (r, c) => {
  if (s.selected.col !== null) {
    let turnItOn = 0
    if (r >= s.selected.row && r <= s.current.row) {
      turnItOn += 1
    } else if (r >= s.current.row && r <= s.selected.row) {
      turnItOn += 1
    }
    if (c >= s.selected.col && c <= s.current.col) {
      turnItOn += 1
    } else if (c >= s.current.col && c <= s.selected.col) {
      turnItOn += 1
    }
    if (turnItOn === 2) {
      return true
    }
  } else {
    return false
  }
}

const keydownHandler = (event) => {
  if (event.code === "KeyA" && event.metaKey === false) {
    event.preventDefault()
    if (s.current.col != 0) {
      s.current.col = s.current.col - 1
    }
    updateStyles()
  } else if (event.code === "KeyD" && event.metaKey === false) {
    event.preventDefault()
    if (s.current.col < colCount() - 1) {
      s.current.col = s.current.col + 1
    }
    updateStyles()
  } else if (event.code === "KeyW" && event.metaKey === false) {
    event.preventDefault()
    if (s.current.row != 0) {
      s.current.row = s.current.row - 1
    }
    updateStyles()
  } else if (event.code === "KeyS" && event.metaKey === false) {
    event.preventDefault()
    if (s.current.row < rowCount() - 1) {
      s.current.row = s.current.row + 1
    }
    updateStyles()
  } else if (event.code === "KeyF" && event.metaKey === false) {
    event.preventDefault()
    d.layers[d.metadata.currentLayer].rows[s.current.row][s.current.col].char = ""
    updateOtherCharacters("")
    render()
  }
}

const loadFile = () => {
  console.log("Loading Data")
  const reader = new FileReader()
  const theFile = loadButton.files[0]
  reader.onload = (e) => {
    const rawFileData = e.target.result
    d = JSON.parse(rawFileData)
    buildCanvas()
  }
  reader.readAsText(theFile)
}

const buildCanvas = () => {
  const tableFrame = document.createElement("table")
  for (let r = 0; r < rowCount(); r++) {
    const tableRow = document.createElement("tr")
    for (let c = 0; c < colCount(); c++) {
      const tableCell = document.createElement("td")
      tableCell.id = `cell_${r}_${c}`
      tableCell.dataset.row = r
      tableCell.dataset.col = c
      tableCell.innerHTML = ""
      tableCell.classList.add("pixel")
      tableCell.classList.add("inactivePixel")
      tableRow.appendChild(tableCell)
    }
    tableFrame.appendChild(tableRow)
  }
  while (bg.children.length > 0) {
    bg.children[0].remove()
  }
  bg.appendChild(tableFrame)
  render()
}

const render = () => {
  while (layerControls.children.length > 0) {
    layerControls.children[0].remove()
  }
  while (freqChars.children.length > 0) {
    freqChars.children[0].remove()
  }
  s.freqChars.forEach((char) => {
    const charButton = document.createElement("button")
    charButton.innerText = char
    charButton.classList.add("char")
    freqChars.appendChild(charButton)
  })
  for (let r = 0; r < rowCount(); r++) {
    for (let c = 0; c < colCount(); c++) {
      document.getElementById(`cell_${r}_${c}`).innerHTML = ""
    }
  }
  d.layers.forEach((layer, layerIndex) => {
    const layerControl = document.createElement("div")
    if (layerIndex === d.metadata.currentLayer) {
      layerControl.classList.add("currentLayerControl")
    }
    const layerSelect = document.createElement("button")
    layerSelect.innerHTML = `Layer: ${layerIndex}`
    layerSelect.dataset.layer = layerIndex
    layerSelect.addEventListener("click", selectLayer)
    layerControl.appendChild(layerSelect)
    const layerToggle = document.createElement("input")
    layerToggle.type = "checkbox"
    layerToggle.dataset.layer = layerIndex
    layerToggle.addEventListener("change", toggleLayer)
    layerControl.appendChild(layerToggle)
    layerControls.appendChild(layerControl)
    if (d.layers[layerIndex].visible) {
      layerToggle.checked = true
      renderLayer(layerIndex)
    }
  })
}

const renderLayer = (layerIndex) => {
  d.layers[layerIndex].rows.forEach((row, rowIndex) => {
    row.forEach((char, charIndex) => {
      const theCell = document.getElementById(`cell_${rowIndex}_${charIndex}`)
      if (char.char !== "") {
        theCell.innerHTML = char.char
        if (layerIndex === d.metadata.currentLayer) {
          theCell.classList.add("activeLayer")
          theCell.classList.remove("lowerLayer")
          theCell.classList.remove("upperLayer")
        } else if (layerIndex < d.metadata.currentLayer) {
          theCell.classList.remove("activeLayer")
          theCell.classList.add("lowerLayer")
          theCell.classList.remove("upperLayer")
        } else if (layerIndex > d.metadata.currentLayer) {
          theCell.classList.remove("activeLayer")
          theCell.classList.remove("lowerLayer")
          theCell.classList.add("upperLayer")
        }
      }
    })
  })
}

const rowCount = () => {
  let rows = 0
  d.layers.forEach((layer) => {
    rows = Math.max(rows, layer.rows.length)
  })
  return rows
}

const saveFile = () => {
  console.log("Saving File")
  const data = new Blob(
    [JSON.stringify(d, null, 2)],
    { type: "application/octet-stream" }
  )
  const link = document.createElement("a")
  link.href = URL.createObjectURL(data)
  link.setAttribute("download", "ascii-shop.json");
  link.click()
}

const selectLayer = (event) => {
  const el = event.srcElement
  d.metadata.currentLayer = parseInt(el.dataset.layer, 10)
  d.layers[d.metadata.currentLayer].visible = true
  render()
}

const toggleLayer = (event) => {
  const el = event.srcElement
  if (el.checked) {
    d.layers[parseInt(el.dataset.layer, 10)].visible = true
    d.metadata.currentLayer = parseInt(el.dataset.layer, 10)
  } else {
    d.layers[parseInt(el.dataset.layer, 10)].visible = false
  }
  render()
}

const updateOtherCharacters = (char) => {
  for (let r = 0; r < rowCount(); r++) {
    for (let c = 0; c < colCount(); c++) {
      if (isPixelSelected(r, c)) {
        d.layers[d.metadata.currentLayer].rows[r][c].char = char
      }
    }
  }
}

const updateStyles = () => {
  console.log(s.current.row)
  console.log(s.current.col)
  for (let r = 0; r < rowCount(); r++) {
    for (let c = 0; c < colCount(); c++) {
      const theCell = document.getElementById(`cell_${r}_${c}`)
      if (isPixelSelected(r, c)) {
        theCell.classList.remove("activePixel")
        theCell.classList.remove("inactivePixel")
        theCell.classList.add("selectedPixel")
      } else {
        theCell.classList.remove("activePixel")
        theCell.classList.remove("selectedPixel")
        theCell.classList.add("inactivePixel")
      }
    }
  }
  const currentPixel = document.getElementById(`cell_${s.current.row}_${s.current.col}`)
  if (currentPixel !== null) {
    currentPixel.classList.remove("inactivePixel")
    currentPixel.classList.add("activePixel")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bg.addEventListener("click", handleCanvasClick)
  addRowButton.addEventListener("click", addRow)
  charContainer.addEventListener("click", handleCharClick)
  duplicateButton.addEventListener("click", duplicateLayer)
  loadButton.addEventListener("change", loadFile)
  saveButton.addEventListener("click", saveFile)
  document.addEventListener("keydown", keydownHandler)
})


const handlePixelClick = (event) => {
  let data = event.srcElement.dataset
  if (event.shiftKey == true) {
    s.selectedChars = []
    s.selected.col = s.current.col
    s.selected.row = s.current.row
    s.current.col = parseInt(data.col, 10)
    s.current.row = parseInt(data.row, 10)
  } else if (event.metaKey == true) {
    s.selectedChars.push([s.current.col, s.current.row])
    s.selected.col = null
    s.selected.row = null
    s.current.col = parseInt(data.col, 10)
    s.current.row = parseInt(data.row, 10)
  } else {
    s.selectedChars = []
    s.selected.col = null
    s.selected.row = null
    s.current.col = parseInt(data.col, 10)
    s.current.row = parseInt(data.row, 10)
  }
  updateStyles()
}

const charCodes = ["&#x0;", "&#xd;", "&#x20;", "&#x21;", "&#x22;", "&#x23;", "&#x24;", "&#x25;", "&#x26;", "&#x27;", "&#x28;", "&#x29;", "&#x2a;", "&#x2b;", "&#x2c;", "&#x2d;", "&#x2e;", "&#x2f;", "&#x30;", "&#x31;", "&#x32;", "&#x33;", "&#x34;", "&#x35;", "&#x36;", "&#x37;", "&#x38;", "&#x39;", "&#x3a;", "&#x3b;", "&#x3c;", "&#x3d;", "&#x3e;", "&#x3f;", "&#x40;", "&#x41;", "&#x42;", "&#x43;", "&#x44;", "&#x45;", "&#x46;", "&#x47;", "&#x48;", "&#x49;", "&#x4a;", "&#x4b;", "&#x4c;", "&#x4d;", "&#x4e;", "&#x4f;", "&#x50;", "&#x51;", "&#x52;", "&#x53;", "&#x54;", "&#x55;", "&#x56;", "&#x57;", "&#x58;", "&#x59;", "&#x5a;", "&#x5b;", "&#x5c;", "&#x5d;", "&#x5e;", "&#x5f;", "&#x60;", "&#x61;", "&#x62;", "&#x63;", "&#x64;", "&#x65;", "&#x66;", "&#x67;", "&#x68;", "&#x69;", "&#x6a;", "&#x6b;", "&#x6c;", "&#x6d;", "&#x6e;", "&#x6f;", "&#x70;", "&#x71;", "&#x72;", "&#x73;", "&#x74;", "&#x75;", "&#x76;", "&#x77;", "&#x78;", "&#x79;", "&#x7a;", "&#x7b;", "&#x7c;", "&#x7d;", "&#x7e;", "&#xa0;", "&#xa1;", "&#xa2;", "&#xa3;", "&#xa4;", "&#xa5;", "&#xa6;", "&#xa7;", "&#xa8;", "&#xa9;", "&#xaa;", "&#xab;", "&#xac;", "&#xad;", "&#xae;", "&#xaf;", "&#xb0;", "&#xb1;", "&#xb2;", "&#xb3;", "&#xb4;", "&#xb5;", "&#xb6;", "&#xb7;", "&#xb8;", "&#xb9;", "&#xba;", "&#xbb;", "&#xbc;", "&#xbd;", "&#xbe;", "&#xbf;", "&#xc0;", "&#xc1;", "&#xc2;", "&#xc3;", "&#xc4;", "&#xc5;", "&#xc6;", "&#xc7;", "&#xc8;", "&#xc9;", "&#xca;", "&#xcb;", "&#xcc;", "&#xcd;", "&#xce;", "&#xcf;", "&#xd0;", "&#xd1;", "&#xd2;", "&#xd3;", "&#xd4;", "&#xd5;", "&#xd6;", "&#xd7;", "&#xd8;", "&#xd9;", "&#xda;", "&#xdb;", "&#xdc;", "&#xdd;", "&#xde;", "&#xdf;", "&#xe0;", "&#xe1;", "&#xe2;", "&#xe3;", "&#xe4;", "&#xe5;", "&#xe6;", "&#xe7;", "&#xe8;", "&#xe9;", "&#xea;", "&#xeb;", "&#xec;", "&#xed;", "&#xee;", "&#xef;", "&#xf0;", "&#xf1;", "&#xf2;", "&#xf3;", "&#xf4;", "&#xf5;", "&#xf6;", "&#xf7;", "&#xf8;", "&#xf9;", "&#xfa;", "&#xfb;", "&#xfc;", "&#xfd;", "&#xfe;", "&#xff;", "&#x100;", "&#x101;", "&#x102;", "&#x103;", "&#x104;", "&#x105;", "&#x106;", "&#x107;", "&#x108;", "&#x109;", "&#x10a;", "&#x10b;", "&#x10c;", "&#x10d;", "&#x10e;", "&#x10f;", "&#x110;", "&#x111;", "&#x112;", "&#x113;", "&#x114;", "&#x115;", "&#x116;", "&#x117;", "&#x118;", "&#x119;", "&#x11a;", "&#x11b;", "&#x11c;", "&#x11d;", "&#x11e;", "&#x11f;", "&#x120;", "&#x121;", "&#x122;", "&#x123;", "&#x124;", "&#x125;", "&#x126;", "&#x127;", "&#x128;", "&#x129;", "&#x12a;", "&#x12b;", "&#x12c;", "&#x12d;", "&#x12e;", "&#x12f;", "&#x130;", "&#x131;", "&#x132;", "&#x133;", "&#x134;", "&#x135;", "&#x136;", "&#x137;", "&#x138;", "&#x139;", "&#x13a;", "&#x13b;", "&#x13c;", "&#x13d;", "&#x13e;", "&#x13f;", "&#x140;", "&#x141;", "&#x142;", "&#x143;", "&#x144;", "&#x145;", "&#x146;", "&#x147;", "&#x148;", "&#x149;", "&#x14a;", "&#x14b;", "&#x14c;", "&#x14d;", "&#x14e;", "&#x14f;", "&#x150;", "&#x151;", "&#x152;", "&#x153;", "&#x154;", "&#x155;", "&#x156;", "&#x157;", "&#x158;", "&#x159;", "&#x15a;", "&#x15b;", "&#x15c;", "&#x15d;", "&#x15e;", "&#x15f;", "&#x160;", "&#x161;", "&#x162;", "&#x163;", "&#x164;", "&#x165;", "&#x166;", "&#x167;", "&#x168;", "&#x169;", "&#x16a;", "&#x16b;", "&#x16c;", "&#x16d;", "&#x16e;", "&#x16f;", "&#x170;", "&#x171;", "&#x172;", "&#x173;", "&#x174;", "&#x175;", "&#x176;", "&#x177;", "&#x178;", "&#x179;", "&#x17a;", "&#x17b;", "&#x17c;", "&#x17d;", "&#x17e;", "&#x17f;", "&#x180;", "&#x181;", "&#x182;", "&#x183;", "&#x184;", "&#x185;", "&#x186;", "&#x187;", "&#x188;", "&#x189;", "&#x18a;", "&#x18b;", "&#x18c;", "&#x18d;", "&#x18e;", "&#x18f;", "&#x190;", "&#x191;", "&#x192;", "&#x193;", "&#x194;", "&#x195;", "&#x196;", "&#x197;", "&#x198;", "&#x199;", "&#x19a;", "&#x19b;", "&#x19c;", "&#x19d;", "&#x19e;", "&#x19f;", "&#x1a0;", "&#x1a1;", "&#x1a2;", "&#x1a3;", "&#x1a4;", "&#x1a5;", "&#x1a6;", "&#x1a7;", "&#x1a8;", "&#x1a9;", "&#x1aa;", "&#x1ab;", "&#x1ac;", "&#x1ad;", "&#x1ae;", "&#x1af;", "&#x1b0;", "&#x1b1;", "&#x1b2;", "&#x1b3;", "&#x1b4;", "&#x1b5;", "&#x1b6;", "&#x1b7;", "&#x1b8;", "&#x1b9;", "&#x1ba;", "&#x1bb;", "&#x1bc;", "&#x1bd;", "&#x1be;", "&#x1bf;", "&#x1c0;", "&#x1c1;", "&#x1c2;", "&#x1c3;", "&#x1c4;", "&#x1c5;", "&#x1c6;", "&#x1c7;", "&#x1c8;", "&#x1c9;", "&#x1ca;", "&#x1cb;", "&#x1cc;", "&#x1cd;", "&#x1ce;", "&#x1cf;", "&#x1d0;", "&#x1d1;", "&#x1d2;", "&#x1d3;", "&#x1d4;", "&#x1d5;", "&#x1d6;", "&#x1d7;", "&#x1d8;", "&#x1d9;", "&#x1da;", "&#x1db;", "&#x1dc;", "&#x1dd;", "&#x1de;", "&#x1df;", "&#x1e0;", "&#x1e1;", "&#x1e2;", "&#x1e3;", "&#x1e4;", "&#x1e5;", "&#x1e6;", "&#x1e7;", "&#x1e8;", "&#x1e9;", "&#x1ea;", "&#x1eb;", "&#x1ec;", "&#x1ed;", "&#x1ee;", "&#x1ef;", "&#x1f0;", "&#x1f1;", "&#x1f2;", "&#x1f3;", "&#x1f4;", "&#x1f5;", "&#x1f6;", "&#x1f7;", "&#x1f8;", "&#x1f9;", "&#x1fa;", "&#x1fb;", "&#x1fc;", "&#x1fd;", "&#x1fe;", "&#x1ff;", "&#x200;", "&#x201;", "&#x202;", "&#x203;", "&#x204;", "&#x205;", "&#x206;", "&#x207;", "&#x208;", "&#x209;", "&#x20a;", "&#x20b;", "&#x20c;", "&#x20d;", "&#x20e;", "&#x20f;", "&#x210;", "&#x211;", "&#x212;", "&#x213;", "&#x214;", "&#x215;", "&#x216;", "&#x217;", "&#x218;", "&#x219;", "&#x21a;", "&#x21b;", "&#x21c;", "&#x21d;", "&#x21e;", "&#x21f;", "&#x220;", "&#x221;", "&#x222;", "&#x223;", "&#x224;", "&#x225;", "&#x226;", "&#x227;", "&#x228;", "&#x229;", "&#x22a;", "&#x22b;", "&#x22c;", "&#x22d;", "&#x22e;", "&#x22f;", "&#x230;", "&#x231;", "&#x232;", "&#x233;", "&#x234;", "&#x235;", "&#x236;", "&#x237;", "&#x238;", "&#x239;", "&#x23a;", "&#x23b;", "&#x23c;", "&#x23d;", "&#x23e;", "&#x23f;", "&#x240;", "&#x241;", "&#x242;", "&#x243;", "&#x244;", "&#x245;", "&#x246;", "&#x247;", "&#x248;", "&#x249;", "&#x24a;", "&#x24b;", "&#x24c;", "&#x24d;", "&#x24e;", "&#x24f;", "&#x250;", "&#x251;", "&#x252;", "&#x253;", "&#x254;", "&#x255;", "&#x256;", "&#x257;", "&#x258;", "&#x259;", "&#x25a;", "&#x25b;", "&#x25c;", "&#x25d;", "&#x25e;", "&#x25f;", "&#x260;", "&#x261;", "&#x262;", "&#x263;", "&#x264;", "&#x265;", "&#x266;", "&#x267;", "&#x268;", "&#x269;", "&#x26a;", "&#x26b;", "&#x26c;", "&#x26d;", "&#x26e;", "&#x26f;", "&#x270;", "&#x271;", "&#x272;", "&#x273;", "&#x274;", "&#x275;", "&#x276;", "&#x277;", "&#x278;", "&#x279;", "&#x27a;", "&#x27b;", "&#x27c;", "&#x27d;", "&#x27e;", "&#x27f;", "&#x280;", "&#x281;", "&#x282;", "&#x283;", "&#x284;", "&#x285;", "&#x286;", "&#x287;", "&#x288;", "&#x289;", "&#x28a;", "&#x28b;", "&#x28c;", "&#x28d;", "&#x28e;", "&#x28f;", "&#x290;", "&#x291;", "&#x292;", "&#x293;", "&#x294;", "&#x295;", "&#x296;", "&#x297;", "&#x298;", "&#x299;", "&#x29a;", "&#x29b;", "&#x29c;", "&#x29d;", "&#x29e;", "&#x29f;", "&#x2a0;", "&#x2a1;", "&#x2a2;", "&#x2a3;", "&#x2a4;", "&#x2a5;", "&#x2a6;", "&#x2a7;", "&#x2a8;", "&#x2a9;", "&#x2aa;", "&#x2ab;", "&#x2ac;", "&#x2ad;", "&#x2ae;", "&#x2af;", "&#x2b0;", "&#x2b1;", "&#x2b2;", "&#x2b3;", "&#x2b4;", "&#x2b5;", "&#x2b6;", "&#x2b7;", "&#x2b8;", "&#x2b9;", "&#x2ba;", "&#x2bb;", "&#x2bc;", "&#x2bd;", "&#x2be;", "&#x2bf;", "&#x2c0;", "&#x2c1;", "&#x2c2;", "&#x2c3;", "&#x2c4;", "&#x2c5;", "&#x2c6;", "&#x2c7;", "&#x2c8;", "&#x2c9;", "&#x2ca;", "&#x2cb;", "&#x2cc;", "&#x2cd;", "&#x2ce;", "&#x2cf;", "&#x2d0;", "&#x2d1;", "&#x2d2;", "&#x2d3;", "&#x2d4;", "&#x2d5;", "&#x2d6;", "&#x2d7;", "&#x2d8;", "&#x2d9;", "&#x2da;", "&#x2db;", "&#x2dc;", "&#x2dd;", "&#x2de;", "&#x2df;", "&#x2e0;", "&#x2e1;", "&#x2e2;", "&#x2e3;", "&#x2e4;", "&#x2e5;", "&#x2e6;", "&#x2e7;", "&#x2e8;", "&#x2e9;", "&#x2ea;", "&#x2eb;", "&#x2ec;", "&#x2ed;", "&#x2ee;", "&#x2ef;", "&#x2f0;", "&#x2f1;", "&#x2f2;", "&#x2f3;", "&#x2f4;", "&#x2f5;", "&#x2f6;", "&#x2f7;", "&#x2f8;", "&#x2f9;", "&#x2fa;", "&#x2fb;", "&#x2fc;", "&#x2fd;", "&#x2fe;", "&#x2ff;", "&#x300;", "&#x301;", "&#x302;", "&#x303;", "&#x304;", "&#x305;", "&#x306;", "&#x307;", "&#x308;", "&#x309;", "&#x30a;", "&#x30b;", "&#x30c;", "&#x30d;", "&#x30e;", "&#x30f;", "&#x310;", "&#x311;", "&#x312;", "&#x313;", "&#x314;", "&#x315;", "&#x316;", "&#x317;", "&#x318;", "&#x319;", "&#x31a;", "&#x31b;", "&#x31c;", "&#x31d;", "&#x31e;", "&#x31f;", "&#x320;", "&#x321;", "&#x322;", "&#x323;", "&#x324;", "&#x325;", "&#x326;", "&#x327;", "&#x328;", "&#x329;", "&#x32a;", "&#x32b;", "&#x32c;", "&#x32d;", "&#x32e;", "&#x32f;", "&#x330;", "&#x331;", "&#x332;", "&#x333;", "&#x334;", "&#x335;", "&#x336;", "&#x337;", "&#x338;", "&#x339;", "&#x33a;", "&#x33b;", "&#x33c;", "&#x33d;", "&#x33e;", "&#x33f;", "&#x340;", "&#x341;", "&#x342;", "&#x343;", "&#x344;", "&#x345;", "&#x346;", "&#x347;", "&#x348;", "&#x349;", "&#x34a;", "&#x34b;", "&#x34c;", "&#x34d;", "&#x34e;", "&#x34f;", "&#x350;", "&#x351;", "&#x352;", "&#x353;", "&#x354;", "&#x355;", "&#x356;", "&#x357;", "&#x358;", "&#x359;", "&#x35a;", "&#x35b;", "&#x35c;", "&#x35d;", "&#x35e;", "&#x35f;", "&#x360;", "&#x361;", "&#x362;", "&#x363;", "&#x364;", "&#x365;", "&#x366;", "&#x367;", "&#x368;", "&#x369;", "&#x36a;", "&#x36b;", "&#x36c;", "&#x36d;", "&#x36e;", "&#x36f;", "&#x370;", "&#x371;", "&#x372;", "&#x373;", "&#x374;", "&#x375;", "&#x376;", "&#x377;", "&#x37a;", "&#x37b;", "&#x37c;", "&#x37d;", "&#x37e;", "&#x37f;", "&#x384;", "&#x385;", "&#x386;", "&#x387;", "&#x388;", "&#x389;", "&#x38a;", "&#x38c;", "&#x38e;", "&#x38f;", "&#x390;", "&#x391;", "&#x392;", "&#x393;", "&#x394;", "&#x395;", "&#x396;", "&#x397;", "&#x398;", "&#x399;", "&#x39a;", "&#x39b;", "&#x39c;", "&#x39d;", "&#x39e;", "&#x39f;", "&#x3a0;", "&#x3a1;", "&#x3a3;", "&#x3a4;", "&#x3a5;", "&#x3a6;", "&#x3a7;", "&#x3a8;", "&#x3a9;", "&#x3aa;", "&#x3ab;", "&#x3ac;", "&#x3ad;", "&#x3ae;", "&#x3af;", "&#x3b0;", "&#x3b1;", "&#x3b2;", "&#x3b3;", "&#x3b4;", "&#x3b5;", "&#x3b6;", "&#x3b7;", "&#x3b8;", "&#x3b9;", "&#x3ba;", "&#x3bb;", "&#x3bc;", "&#x3bd;", "&#x3be;", "&#x3bf;", "&#x3c0;", "&#x3c1;", "&#x3c2;", "&#x3c3;", "&#x3c4;", "&#x3c5;", "&#x3c6;", "&#x3c7;", "&#x3c8;", "&#x3c9;", "&#x3ca;", "&#x3cb;", "&#x3cc;", "&#x3cd;", "&#x3ce;", "&#x3cf;", "&#x3d0;", "&#x3d1;", "&#x3d2;", "&#x3d3;", "&#x3d4;", "&#x3d5;", "&#x3d6;", "&#x3d7;", "&#x3d8;", "&#x3d9;", "&#x3da;", "&#x3db;", "&#x3dc;", "&#x3dd;", "&#x3de;", "&#x3df;", "&#x3e0;", "&#x3e1;", "&#x3f0;", "&#x3f1;", "&#x3f2;", "&#x3f3;", "&#x3f4;", "&#x3f5;", "&#x3f6;", "&#x3f7;", "&#x3f8;", "&#x3f9;", "&#x3fa;", "&#x3fb;", "&#x3fc;", "&#x3fd;", "&#x3fe;", "&#x3ff;", "&#x400;", "&#x401;", "&#x402;", "&#x403;", "&#x404;", "&#x405;", "&#x406;", "&#x407;", "&#x408;", "&#x409;", "&#x40a;", "&#x40b;", "&#x40c;", "&#x40d;", "&#x40e;", "&#x40f;", "&#x410;", "&#x411;", "&#x412;", "&#x413;", "&#x414;", "&#x415;", "&#x416;", "&#x417;", "&#x418;", "&#x419;", "&#x41a;", "&#x41b;", "&#x41c;", "&#x41d;", "&#x41e;", "&#x41f;", "&#x420;", "&#x421;", "&#x422;", "&#x423;", "&#x424;", "&#x425;", "&#x426;", "&#x427;", "&#x428;", "&#x429;", "&#x42a;", "&#x42b;", "&#x42c;", "&#x42d;", "&#x42e;", "&#x42f;", "&#x430;", "&#x431;", "&#x432;", "&#x433;", "&#x434;", "&#x435;", "&#x436;", "&#x437;", "&#x438;", "&#x439;", "&#x43a;", "&#x43b;", "&#x43c;", "&#x43d;", "&#x43e;", "&#x43f;", "&#x440;", "&#x441;", "&#x442;", "&#x443;", "&#x444;", "&#x445;", "&#x446;", "&#x447;", "&#x448;", "&#x449;", "&#x44a;", "&#x44b;", "&#x44c;", "&#x44d;", "&#x44e;", "&#x44f;", "&#x450;", "&#x451;", "&#x452;", "&#x453;", "&#x454;", "&#x455;", "&#x456;", "&#x457;", "&#x458;", "&#x459;", "&#x45a;", "&#x45b;", "&#x45c;", "&#x45d;", "&#x45e;", "&#x45f;", "&#x460;", "&#x461;", "&#x462;", "&#x463;", "&#x464;", "&#x465;", "&#x466;", "&#x467;", "&#x468;", "&#x469;", "&#x46a;", "&#x46b;", "&#x46c;", "&#x46d;", "&#x46e;", "&#x46f;", "&#x470;", "&#x471;", "&#x472;", "&#x473;", "&#x474;", "&#x475;", "&#x476;", "&#x477;", "&#x478;", "&#x479;", "&#x47a;", "&#x47b;", "&#x47c;", "&#x47d;", "&#x47e;", "&#x47f;", "&#x480;", "&#x481;", "&#x482;", "&#x483;", "&#x484;", "&#x485;", "&#x486;", "&#x487;", "&#x488;", "&#x489;", "&#x48a;", "&#x48b;", "&#x48c;", "&#x48d;", "&#x48e;", "&#x48f;", "&#x490;", "&#x491;", "&#x492;", "&#x493;", "&#x494;", "&#x495;", "&#x496;", "&#x497;", "&#x498;", "&#x499;", "&#x49a;", "&#x49b;", "&#x49c;", "&#x49d;", "&#x49e;", "&#x49f;", "&#x4a0;", "&#x4a1;", "&#x4a2;", "&#x4a3;", "&#x4a4;", "&#x4a5;", "&#x4a6;", "&#x4a7;", "&#x4a8;", "&#x4a9;", "&#x4aa;", "&#x4ab;", "&#x4ac;", "&#x4ad;", "&#x4ae;", "&#x4af;", "&#x4b0;", "&#x4b1;", "&#x4b2;", "&#x4b3;", "&#x4b4;", "&#x4b5;", "&#x4b6;", "&#x4b7;", "&#x4b8;", "&#x4b9;", "&#x4ba;", "&#x4bb;", "&#x4bc;", "&#x4bd;", "&#x4be;", "&#x4bf;", "&#x4c0;", "&#x4c1;", "&#x4c2;", "&#x4c3;", "&#x4c4;", "&#x4c5;", "&#x4c6;", "&#x4c7;", "&#x4c8;", "&#x4c9;", "&#x4ca;", "&#x4cb;", "&#x4cc;", "&#x4cd;", "&#x4ce;", "&#x4cf;", "&#x4d0;", "&#x4d1;", "&#x4d2;", "&#x4d3;", "&#x4d4;", "&#x4d5;", "&#x4d6;", "&#x4d7;", "&#x4d8;", "&#x4d9;", "&#x4da;", "&#x4db;", "&#x4dc;", "&#x4dd;", "&#x4de;", "&#x4df;", "&#x4e0;", "&#x4e1;", "&#x4e2;", "&#x4e3;", "&#x4e4;", "&#x4e5;", "&#x4e6;", "&#x4e7;", "&#x4e8;", "&#x4e9;", "&#x4ea;", "&#x4eb;", "&#x4ec;", "&#x4ed;", "&#x4ee;", "&#x4ef;", "&#x4f0;", "&#x4f1;", "&#x4f2;", "&#x4f3;", "&#x4f4;", "&#x4f5;", "&#x4f6;", "&#x4f7;", "&#x4f8;", "&#x4f9;", "&#x4fa;", "&#x4fb;", "&#x4fc;", "&#x4fd;", "&#x4fe;", "&#x4ff;", "&#x500;", "&#x501;", "&#x502;", "&#x503;", "&#x504;", "&#x505;", "&#x506;", "&#x507;", "&#x508;", "&#x509;", "&#x50a;", "&#x50b;", "&#x50c;", "&#x50d;", "&#x50e;", "&#x50f;", "&#x510;", "&#x511;", "&#x512;", "&#x513;", "&#x514;", "&#x515;", "&#x516;", "&#x517;", "&#x518;", "&#x519;", "&#x51a;", "&#x51b;", "&#x51c;", "&#x51d;", "&#x51e;", "&#x51f;", "&#x520;", "&#x521;", "&#x522;", "&#x523;", "&#x524;", "&#x525;", "&#x526;", "&#x527;", "&#x528;", "&#x529;", "&#x52a;", "&#x52b;", "&#x52c;", "&#x52d;", "&#x52e;", "&#x52f;", "&#x900;", "&#x901;", "&#x902;", "&#x903;", "&#x904;", "&#x905;", "&#x906;", "&#x907;", "&#x908;", "&#x909;", "&#x90a;", "&#x90b;", "&#x90c;", "&#x90d;", "&#x90e;", "&#x90f;", "&#x910;", "&#x911;", "&#x912;", "&#x913;", "&#x914;", "&#x915;", "&#x916;", "&#x917;", "&#x918;", "&#x919;", "&#x91a;", "&#x91b;", "&#x91c;", "&#x91d;", "&#x91e;", "&#x91f;", "&#x920;", "&#x921;", "&#x922;", "&#x923;", "&#x924;", "&#x925;", "&#x926;", "&#x927;", "&#x928;", "&#x929;", "&#x92a;", "&#x92b;", "&#x92c;", "&#x92d;", "&#x92e;", "&#x92f;", "&#x930;", "&#x931;", "&#x932;", "&#x933;", "&#x934;", "&#x935;", "&#x936;", "&#x937;", "&#x938;", "&#x939;", "&#x93a;", "&#x93b;", "&#x93c;", "&#x93d;", "&#x93e;", "&#x93f;", "&#x940;", "&#x941;", "&#x942;", "&#x943;", "&#x944;", "&#x945;", "&#x946;", "&#x947;", "&#x948;", "&#x949;", "&#x94a;", "&#x94b;", "&#x94c;", "&#x94d;", "&#x94e;", "&#x94f;", "&#x950;", "&#x951;", "&#x952;", "&#x953;", "&#x954;", "&#x955;", "&#x956;", "&#x957;", "&#x958;", "&#x959;", "&#x95a;", "&#x95b;", "&#x95c;", "&#x95d;", "&#x95e;", "&#x95f;", "&#x960;", "&#x961;", "&#x962;", "&#x963;", "&#x964;", "&#x965;", "&#x966;", "&#x967;", "&#x968;", "&#x969;", "&#x96a;", "&#x96b;", "&#x96c;", "&#x96d;", "&#x96e;", "&#x96f;", "&#x970;", "&#x971;", "&#x972;", "&#x973;", "&#x974;", "&#x975;", "&#x976;", "&#x977;", "&#x978;", "&#x979;", "&#x97a;", "&#x97b;", "&#x97c;", "&#x97d;", "&#x97e;", "&#x97f;", "&#x1ab0;", "&#x1ab1;", "&#x1ab2;", "&#x1ab3;", "&#x1ab4;", "&#x1ab5;", "&#x1ab6;", "&#x1ab7;", "&#x1ab8;", "&#x1ab9;", "&#x1aba;", "&#x1abb;", "&#x1abc;", "&#x1abd;", "&#x1abe;", "&#x1abf;", "&#x1ac0;", "&#x1c80;", "&#x1c81;", "&#x1c82;", "&#x1c83;", "&#x1c84;", "&#x1c85;", "&#x1c86;", "&#x1c87;", "&#x1c88;", "&#x1cd0;", "&#x1cd1;", "&#x1cd2;", "&#x1cd3;", "&#x1cd4;", "&#x1cd5;", "&#x1cd6;", "&#x1cd7;", "&#x1cd8;", "&#x1cd9;", "&#x1cda;", "&#x1cdb;", "&#x1cdc;", "&#x1cdd;", "&#x1cde;", "&#x1cdf;", "&#x1ce0;", "&#x1ce1;", "&#x1ce2;", "&#x1ce3;", "&#x1ce4;", "&#x1ce5;", "&#x1ce6;", "&#x1ce7;", "&#x1ce8;", "&#x1ce9;", "&#x1cea;", "&#x1ceb;", "&#x1cec;", "&#x1ced;", "&#x1cee;", "&#x1cef;", "&#x1cf0;", "&#x1cf1;", "&#x1cf2;", "&#x1cf3;", "&#x1cf4;", "&#x1cf5;", "&#x1cf6;", "&#x1cf8;", "&#x1cf9;", "&#x1d00;", "&#x1d01;", "&#x1d02;", "&#x1d03;", "&#x1d04;", "&#x1d05;", "&#x1d06;", "&#x1d07;", "&#x1d08;", "&#x1d09;", "&#x1d0a;", "&#x1d0b;", "&#x1d0c;", "&#x1d0d;", "&#x1d0e;", "&#x1d0f;", "&#x1d10;", "&#x1d11;", "&#x1d12;", "&#x1d13;", "&#x1d14;", "&#x1d15;", "&#x1d16;", "&#x1d17;", "&#x1d18;", "&#x1d19;", "&#x1d1a;", "&#x1d1b;", "&#x1d1c;", "&#x1d1d;", "&#x1d1e;", "&#x1d1f;", "&#x1d20;", "&#x1d21;", "&#x1d22;", "&#x1d23;", "&#x1d24;", "&#x1d25;", "&#x1d26;", "&#x1d27;", "&#x1d28;", "&#x1d29;", "&#x1d2a;", "&#x1d2b;", "&#x1d2c;", "&#x1d2d;", "&#x1d2e;", "&#x1d2f;", "&#x1d30;", "&#x1d31;", "&#x1d32;", "&#x1d33;", "&#x1d34;", "&#x1d35;", "&#x1d36;", "&#x1d37;", "&#x1d38;", "&#x1d39;", "&#x1d3a;", "&#x1d3b;", "&#x1d3c;", "&#x1d3d;", "&#x1d3e;", "&#x1d3f;", "&#x1d40;", "&#x1d41;", "&#x1d42;", "&#x1d43;", "&#x1d44;", "&#x1d45;", "&#x1d46;", "&#x1d47;", "&#x1d48;", "&#x1d49;", "&#x1d4a;", "&#x1d4b;", "&#x1d4c;", "&#x1d4d;", "&#x1d4e;", "&#x1d4f;", "&#x1d50;", "&#x1d51;", "&#x1d52;", "&#x1d53;", "&#x1d54;", "&#x1d55;", "&#x1d56;", "&#x1d57;", "&#x1d58;", "&#x1d59;", "&#x1d5a;", "&#x1d5b;", "&#x1d5c;", "&#x1d5d;", "&#x1d5e;", "&#x1d5f;", "&#x1d60;", "&#x1d61;", "&#x1d62;", "&#x1d63;", "&#x1d64;", "&#x1d65;", "&#x1d66;", "&#x1d67;", "&#x1d68;", "&#x1d69;", "&#x1d6a;", "&#x1d6b;", "&#x1d6c;", "&#x1d6d;", "&#x1d6e;", "&#x1d6f;", "&#x1d70;", "&#x1d71;", "&#x1d72;", "&#x1d73;", "&#x1d74;", "&#x1d75;", "&#x1d76;", "&#x1d77;", "&#x1d78;", "&#x1d79;", "&#x1d7a;", "&#x1d7b;", "&#x1d7c;", "&#x1d7d;", "&#x1d7e;", "&#x1d7f;", "&#x1d80;", "&#x1d81;", "&#x1d82;", "&#x1d83;", "&#x1d84;", "&#x1d85;", "&#x1d86;", "&#x1d87;", "&#x1d88;", "&#x1d89;", "&#x1d8a;", "&#x1d8b;", "&#x1d8c;", "&#x1d8d;", "&#x1d8e;", "&#x1d8f;", "&#x1d90;", "&#x1d91;", "&#x1d92;", "&#x1d93;", "&#x1d94;", "&#x1d95;", "&#x1d96;", "&#x1d97;", "&#x1d98;", "&#x1d99;", "&#x1d9a;", "&#x1d9b;", "&#x1d9c;", "&#x1d9d;", "&#x1d9e;", "&#x1d9f;", "&#x1da0;", "&#x1da1;", "&#x1da2;", "&#x1da3;", "&#x1da4;", "&#x1da5;", "&#x1da6;", "&#x1da7;", "&#x1da8;", "&#x1da9;", "&#x1daa;", "&#x1dab;", "&#x1dac;", "&#x1dad;", "&#x1dae;", "&#x1daf;", "&#x1db0;", "&#x1db1;", "&#x1db2;", "&#x1db3;", "&#x1db4;", "&#x1db5;", "&#x1db6;", "&#x1db7;", "&#x1db8;", "&#x1db9;", "&#x1dba;", "&#x1dbb;", "&#x1dbc;", "&#x1dbd;", "&#x1dbe;", "&#x1dbf;", "&#x1dc0;", "&#x1dc1;", "&#x1dc2;", "&#x1dc3;", "&#x1dc4;", "&#x1dc5;", "&#x1dc6;", "&#x1dc7;", "&#x1dc8;", "&#x1dc9;", "&#x1dca;", "&#x1dcb;", "&#x1dcc;", "&#x1dcd;", "&#x1dce;", "&#x1dcf;", "&#x1dd0;", "&#x1dd1;", "&#x1dd2;", "&#x1dd3;", "&#x1dd4;", "&#x1dd5;", "&#x1dd6;", "&#x1dd7;", "&#x1dd8;", "&#x1dd9;", "&#x1dda;", "&#x1ddb;", "&#x1ddc;", "&#x1ddd;", "&#x1dde;", "&#x1ddf;", "&#x1de0;", "&#x1de1;", "&#x1de2;", "&#x1de3;", "&#x1de4;", "&#x1de5;", "&#x1de6;", "&#x1de7;", "&#x1de8;", "&#x1de9;", "&#x1dea;", "&#x1deb;", "&#x1dec;", "&#x1ded;", "&#x1dee;", "&#x1def;", "&#x1df0;", "&#x1df1;", "&#x1df2;", "&#x1df3;", "&#x1df4;", "&#x1df5;", "&#x1df6;", "&#x1df7;", "&#x1df8;", "&#x1df9;", "&#x1dfb;", "&#x1dfc;", "&#x1dfd;", "&#x1dfe;", "&#x1dff;", "&#x1e00;", "&#x1e01;", "&#x1e02;", "&#x1e03;", "&#x1e04;", "&#x1e05;", "&#x1e06;", "&#x1e07;", "&#x1e08;", "&#x1e09;", "&#x1e0a;", "&#x1e0b;", "&#x1e0c;", "&#x1e0d;", "&#x1e0e;", "&#x1e0f;", "&#x1e10;", "&#x1e11;", "&#x1e12;", "&#x1e13;", "&#x1e14;", "&#x1e15;", "&#x1e16;", "&#x1e17;", "&#x1e18;", "&#x1e19;", "&#x1e1a;", "&#x1e1b;", "&#x1e1c;", "&#x1e1d;", "&#x1e1e;", "&#x1e1f;", "&#x1e20;", "&#x1e21;", "&#x1e22;", "&#x1e23;", "&#x1e24;", "&#x1e25;", "&#x1e26;", "&#x1e27;", "&#x1e28;", "&#x1e29;", "&#x1e2a;", "&#x1e2b;", "&#x1e2c;", "&#x1e2d;", "&#x1e2e;", "&#x1e2f;", "&#x1e30;", "&#x1e31;", "&#x1e32;", "&#x1e33;", "&#x1e34;", "&#x1e35;", "&#x1e36;", "&#x1e37;", "&#x1e38;", "&#x1e39;", "&#x1e3a;", "&#x1e3b;", "&#x1e3c;", "&#x1e3d;", "&#x1e3e;", "&#x1e3f;", "&#x1e40;", "&#x1e41;", "&#x1e42;", "&#x1e43;", "&#x1e44;", "&#x1e45;", "&#x1e46;", "&#x1e47;", "&#x1e48;", "&#x1e49;", "&#x1e4a;", "&#x1e4b;", "&#x1e4c;", "&#x1e4d;", "&#x1e4e;", "&#x1e4f;", "&#x1e50;", "&#x1e51;", "&#x1e52;", "&#x1e53;", "&#x1e54;", "&#x1e55;", "&#x1e56;", "&#x1e57;", "&#x1e58;", "&#x1e59;", "&#x1e5a;", "&#x1e5b;", "&#x1e5c;", "&#x1e5d;", "&#x1e5e;", "&#x1e5f;", "&#x1e60;", "&#x1e61;", "&#x1e62;", "&#x1e63;", "&#x1e64;", "&#x1e65;", "&#x1e66;", "&#x1e67;", "&#x1e68;", "&#x1e69;", "&#x1e6a;", "&#x1e6b;", "&#x1e6c;", "&#x1e6d;", "&#x1e6e;", "&#x1e6f;", "&#x1e70;", "&#x1e71;", "&#x1e72;", "&#x1e73;", "&#x1e74;", "&#x1e75;", "&#x1e76;", "&#x1e77;", "&#x1e78;", "&#x1e79;", "&#x1e7a;", "&#x1e7b;", "&#x1e7c;", "&#x1e7d;", "&#x1e7e;", "&#x1e7f;", "&#x1e80;", "&#x1e81;", "&#x1e82;", "&#x1e83;", "&#x1e84;", "&#x1e85;", "&#x1e86;", "&#x1e87;", "&#x1e88;", "&#x1e89;", "&#x1e8a;", "&#x1e8b;", "&#x1e8c;", "&#x1e8d;", "&#x1e8e;", "&#x1e8f;", "&#x1e90;", "&#x1e91;", "&#x1e92;", "&#x1e93;", "&#x1e94;", "&#x1e95;", "&#x1e96;", "&#x1e97;", "&#x1e98;", "&#x1e99;", "&#x1e9a;", "&#x1e9b;", "&#x1e9c;", "&#x1e9d;", "&#x1e9e;", "&#x1e9f;", "&#x1ea0;", "&#x1ea1;", "&#x1ea2;", "&#x1ea3;", "&#x1ea4;", "&#x1ea5;", "&#x1ea6;", "&#x1ea7;", "&#x1ea8;", "&#x1ea9;", "&#x1eaa;", "&#x1eab;", "&#x1eac;", "&#x1ead;", "&#x1eae;", "&#x1eaf;", "&#x1eb0;", "&#x1eb1;", "&#x1eb2;", "&#x1eb3;", "&#x1eb4;", "&#x1eb5;", "&#x1eb6;", "&#x1eb7;", "&#x1eb8;", "&#x1eb9;", "&#x1eba;", "&#x1ebb;", "&#x1ebc;", "&#x1ebd;", "&#x1ebe;", "&#x1ebf;", "&#x1ec0;", "&#x1ec1;", "&#x1ec2;", "&#x1ec3;", "&#x1ec4;", "&#x1ec5;", "&#x1ec6;", "&#x1ec7;", "&#x1ec8;", "&#x1ec9;", "&#x1eca;", "&#x1ecb;", "&#x1ecc;", "&#x1ecd;", "&#x1ece;", "&#x1ecf;", "&#x1ed0;", "&#x1ed1;", "&#x1ed2;", "&#x1ed3;", "&#x1ed4;", "&#x1ed5;", "&#x1ed6;", "&#x1ed7;", "&#x1ed8;", "&#x1ed9;", "&#x1eda;", "&#x1edb;", "&#x1edc;", "&#x1edd;", "&#x1ede;", "&#x1edf;", "&#x1ee0;", "&#x1ee1;", "&#x1ee2;", "&#x1ee3;", "&#x1ee4;", "&#x1ee5;", "&#x1ee6;", "&#x1ee7;", "&#x1ee8;", "&#x1ee9;", "&#x1eea;", "&#x1eeb;", "&#x1eec;", "&#x1eed;", "&#x1eee;", "&#x1eef;", "&#x1ef0;", "&#x1ef1;", "&#x1ef2;", "&#x1ef3;", "&#x1ef4;", "&#x1ef5;", "&#x1ef6;", "&#x1ef7;", "&#x1ef8;", "&#x1ef9;", "&#x1efa;", "&#x1efb;", "&#x1efc;", "&#x1efd;", "&#x1efe;", "&#x1eff;", "&#x1f00;", "&#x1f01;", "&#x1f02;", "&#x1f03;", "&#x1f04;", "&#x1f05;", "&#x1f06;", "&#x1f07;", "&#x1f08;", "&#x1f09;", "&#x1f0a;", "&#x1f0b;", "&#x1f0c;", "&#x1f0d;", "&#x1f0e;", "&#x1f0f;", "&#x1f10;", "&#x1f11;", "&#x1f12;", "&#x1f13;", "&#x1f14;", "&#x1f15;", "&#x1f18;", "&#x1f19;", "&#x1f1a;", "&#x1f1b;", "&#x1f1c;", "&#x1f1d;", "&#x1f20;", "&#x1f21;", "&#x1f22;", "&#x1f23;", "&#x1f24;", "&#x1f25;", "&#x1f26;", "&#x1f27;", "&#x1f28;", "&#x1f29;", "&#x1f2a;", "&#x1f2b;", "&#x1f2c;", "&#x1f2d;", "&#x1f2e;", "&#x1f2f;", "&#x1f30;", "&#x1f31;", "&#x1f32;", "&#x1f33;", "&#x1f34;", "&#x1f35;", "&#x1f36;", "&#x1f37;", "&#x1f38;", "&#x1f39;", "&#x1f3a;", "&#x1f3b;", "&#x1f3c;", "&#x1f3d;", "&#x1f3e;", "&#x1f3f;", "&#x1f40;", "&#x1f41;", "&#x1f42;", "&#x1f43;", "&#x1f44;", "&#x1f45;", "&#x1f48;", "&#x1f49;", "&#x1f4a;", "&#x1f4b;", "&#x1f4c;", "&#x1f4d;", "&#x1f50;", "&#x1f51;", "&#x1f52;", "&#x1f53;", "&#x1f54;", "&#x1f55;", "&#x1f56;", "&#x1f57;", "&#x1f59;", "&#x1f5b;", "&#x1f5d;", "&#x1f5f;", "&#x1f60;", "&#x1f61;", "&#x1f62;", "&#x1f63;", "&#x1f64;", "&#x1f65;", "&#x1f66;", "&#x1f67;", "&#x1f68;", "&#x1f69;", "&#x1f6a;", "&#x1f6b;", "&#x1f6c;", "&#x1f6d;", "&#x1f6e;", "&#x1f6f;", "&#x1f70;", "&#x1f71;", "&#x1f72;", "&#x1f73;", "&#x1f74;", "&#x1f75;", "&#x1f76;", "&#x1f77;", "&#x1f78;", "&#x1f79;", "&#x1f7a;", "&#x1f7b;", "&#x1f7c;", "&#x1f7d;", "&#x1f80;", "&#x1f81;", "&#x1f82;", "&#x1f83;", "&#x1f84;", "&#x1f85;", "&#x1f86;", "&#x1f87;", "&#x1f88;", "&#x1f89;", "&#x1f8a;", "&#x1f8b;", "&#x1f8c;", "&#x1f8d;", "&#x1f8e;", "&#x1f8f;", "&#x1f90;", "&#x1f91;", "&#x1f92;", "&#x1f93;", "&#x1f94;", "&#x1f95;", "&#x1f96;", "&#x1f97;", "&#x1f98;", "&#x1f99;", "&#x1f9a;", "&#x1f9b;", "&#x1f9c;", "&#x1f9d;", "&#x1f9e;", "&#x1f9f;", "&#x1fa0;", "&#x1fa1;", "&#x1fa2;", "&#x1fa3;", "&#x1fa4;", "&#x1fa5;", "&#x1fa6;", "&#x1fa7;", "&#x1fa8;", "&#x1fa9;", "&#x1faa;", "&#x1fab;", "&#x1fac;", "&#x1fad;", "&#x1fae;", "&#x1faf;", "&#x1fb0;", "&#x1fb1;", "&#x1fb2;", "&#x1fb3;", "&#x1fb4;", "&#x1fb6;", "&#x1fb7;", "&#x1fb8;", "&#x1fb9;", "&#x1fba;", "&#x1fbb;", "&#x1fbc;", "&#x1fbd;", "&#x1fbe;", "&#x1fbf;", "&#x1fc0;", "&#x1fc1;", "&#x1fc2;", "&#x1fc3;", "&#x1fc4;", "&#x1fc6;", "&#x1fc7;", "&#x1fc8;", "&#x1fc9;", "&#x1fca;", "&#x1fcb;", "&#x1fcc;", "&#x1fcd;", "&#x1fce;", "&#x1fcf;", "&#x1fd0;", "&#x1fd1;", "&#x1fd2;", "&#x1fd3;", "&#x1fd6;", "&#x1fd7;", "&#x1fd8;", "&#x1fd9;", "&#x1fda;", "&#x1fdb;", "&#x1fdd;", "&#x1fde;", "&#x1fdf;", "&#x1fe0;", "&#x1fe1;", "&#x1fe2;", "&#x1fe3;", "&#x1fe4;", "&#x1fe5;", "&#x1fe6;", "&#x1fe7;", "&#x1fe8;", "&#x1fe9;", "&#x1fea;", "&#x1feb;", "&#x1fec;", "&#x1fed;", "&#x1fee;", "&#x1fef;", "&#x1ff2;", "&#x1ff3;", "&#x1ff4;", "&#x1ff6;", "&#x1ff7;", "&#x1ff8;", "&#x1ff9;", "&#x1ffa;", "&#x1ffb;", "&#x1ffc;", "&#x1ffd;", "&#x1ffe;", "&#x2000;", "&#x2001;", "&#x2002;", "&#x2003;", "&#x2004;", "&#x2005;", "&#x2006;", "&#x2007;", "&#x2008;", "&#x2009;", "&#x200a;", "&#x200b;", "&#x200c;", "&#x200d;", "&#x200e;", "&#x200f;", "&#x2010;", "&#x2011;", "&#x2012;", "&#x2013;", "&#x2014;", "&#x2015;", "&#x2016;", "&#x2017;", "&#x2018;", "&#x2019;", "&#x201a;", "&#x201b;", "&#x201c;", "&#x201d;", "&#x201e;", "&#x201f;", "&#x2020;", "&#x2021;", "&#x2022;", "&#x2023;", "&#x2024;", "&#x2025;", "&#x2026;", "&#x2027;", "&#x2028;", "&#x2029;", "&#x202a;", "&#x202b;", "&#x202c;", "&#x202d;", "&#x202e;", "&#x202f;", "&#x2030;", "&#x2031;", "&#x2032;", "&#x2033;", "&#x2034;", "&#x2035;", "&#x2036;", "&#x2037;", "&#x2038;", "&#x2039;", "&#x203a;", "&#x203b;", "&#x203c;", "&#x203d;", "&#x203e;", "&#x203f;", "&#x2040;", "&#x2041;", "&#x2042;", "&#x2043;", "&#x2044;", "&#x2045;", "&#x2046;", "&#x2047;", "&#x2048;", "&#x2049;", "&#x204a;", "&#x204b;", "&#x204c;", "&#x204d;", "&#x204e;", "&#x204f;", "&#x2050;", "&#x2051;", "&#x2052;", "&#x2053;", "&#x2054;", "&#x2055;", "&#x2056;", "&#x2057;", "&#x2058;", "&#x2059;", "&#x205a;", "&#x205b;", "&#x205c;", "&#x205d;", "&#x205e;", "&#x205f;", "&#x2060;", "&#x2061;", "&#x2062;", "&#x2063;", "&#x2064;", "&#x2066;", "&#x2067;", "&#x2068;", "&#x2069;", "&#x206a;", "&#x206b;", "&#x206c;", "&#x206d;", "&#x206e;", "&#x206f;", "&#x2070;", "&#x2071;", "&#x2074;", "&#x2075;", "&#x2076;", "&#x2077;", "&#x2078;", "&#x2079;", "&#x207a;", "&#x207b;", "&#x207c;", "&#x207d;", "&#x207e;", "&#x207f;", "&#x2080;", "&#x2081;", "&#x2082;", "&#x2083;", "&#x2084;", "&#x2085;", "&#x2086;", "&#x2087;", "&#x2088;", "&#x2089;", "&#x208a;", "&#x208b;", "&#x208c;", "&#x208d;", "&#x208e;", "&#x2090;", "&#x2091;", "&#x2092;", "&#x2093;", "&#x2094;", "&#x2095;", "&#x2096;", "&#x2097;", "&#x2098;", "&#x2099;", "&#x209a;", "&#x209b;", "&#x209c;", "&#x20a0;", "&#x20a1;", "&#x20a2;", "&#x20a3;", "&#x20a4;", "&#x20a5;", "&#x20a6;", "&#x20a7;", "&#x20a8;", "&#x20a9;", "&#x20aa;", "&#x20ab;", "&#x20ac;", "&#x20ad;", "&#x20ae;", "&#x20af;", "&#x20b0;", "&#x20b1;", "&#x20b2;", "&#x20b3;", "&#x20b4;", "&#x20b5;", "&#x20b6;", "&#x20b7;", "&#x20b8;", "&#x20b9;", "&#x20ba;", "&#x20bb;", "&#x20bc;", "&#x20bd;", "&#x20be;", "&#x20bf;", "&#x20f0;", "&#x2100;", "&#x2101;", "&#x2102;", "&#x2103;", "&#x2104;", "&#x2105;", "&#x2106;", "&#x2107;", "&#x2108;", "&#x2109;", "&#x210a;", "&#x210b;", "&#x210c;", "&#x210d;", "&#x210e;", "&#x210f;", "&#x2110;", "&#x2111;", "&#x2112;", "&#x2113;", "&#x2114;", "&#x2115;", "&#x2116;", "&#x2117;", "&#x2118;", "&#x2119;", "&#x211a;", "&#x211b;", "&#x211c;", "&#x211d;", "&#x211e;", "&#x211f;", "&#x2120;", "&#x2121;", "&#x2122;", "&#x2123;", "&#x2124;", "&#x2125;", "&#x2126;", "&#x2127;", "&#x2128;", "&#x2129;", "&#x212a;", "&#x212b;", "&#x212c;", "&#x212d;", "&#x212e;", "&#x212f;", "&#x2130;", "&#x2131;", "&#x2132;", "&#x2133;", "&#x2134;", "&#x2135;", "&#x2136;", "&#x2137;", "&#x2138;", "&#x2139;", "&#x213a;", "&#x213b;", "&#x213c;", "&#x213d;", "&#x213e;", "&#x213f;", "&#x2140;", "&#x2141;", "&#x2142;", "&#x2143;", "&#x2144;", "&#x2145;", "&#x2146;", "&#x2147;", "&#x2148;", "&#x2149;", "&#x214a;", "&#x214b;", "&#x214c;", "&#x214d;", "&#x214e;", "&#x214f;", "&#x2150;", "&#x2151;", "&#x2152;", "&#x2153;", "&#x2154;", "&#x2155;", "&#x2156;", "&#x2157;", "&#x2158;", "&#x2159;", "&#x215a;", "&#x215b;", "&#x215c;", "&#x215d;", "&#x215e;", "&#x215f;", "&#x2184;", "&#x2189;", "&#x2212;", "&#x2215;", "&#x25cc;", "&#x2c60;", "&#x2c61;", "&#x2c62;", "&#x2c63;", "&#x2c64;", "&#x2c65;", "&#x2c66;", "&#x2c67;", "&#x2c68;", "&#x2c69;", "&#x2c6a;", "&#x2c6b;", "&#x2c6c;", "&#x2c6d;", "&#x2c6e;", "&#x2c6f;", "&#x2c70;", "&#x2c71;", "&#x2c72;", "&#x2c73;", "&#x2c74;", "&#x2c75;", "&#x2c76;", "&#x2c77;", "&#x2c78;", "&#x2c79;", "&#x2c7a;", "&#x2c7b;", "&#x2c7c;", "&#x2c7d;", "&#x2c7e;", "&#x2c7f;", "&#x2de0;", "&#x2de1;", "&#x2de2;", "&#x2de3;", "&#x2de4;", "&#x2de5;", "&#x2de6;", "&#x2de7;", "&#x2de8;", "&#x2de9;", "&#x2dea;", "&#x2deb;", "&#x2dec;", "&#x2ded;", "&#x2dee;", "&#x2def;", "&#x2df0;", "&#x2df1;", "&#x2df2;", "&#x2df3;", "&#x2df4;", "&#x2df5;", "&#x2df6;", "&#x2df7;", "&#x2df8;", "&#x2df9;", "&#x2dfa;", "&#x2dfb;", "&#x2dfc;", "&#x2dfd;", "&#x2dfe;", "&#x2dff;", "&#x2e00;", "&#x2e01;", "&#x2e02;", "&#x2e03;", "&#x2e04;", "&#x2e05;", "&#x2e06;", "&#x2e07;", "&#x2e08;", "&#x2e09;", "&#x2e0a;", "&#x2e0b;", "&#x2e0c;", "&#x2e0d;", "&#x2e0e;", "&#x2e0f;", "&#x2e10;", "&#x2e11;", "&#x2e12;", "&#x2e13;", "&#x2e14;", "&#x2e15;", "&#x2e16;", "&#x2e17;", "&#x2e18;", "&#x2e19;", "&#x2e1a;", "&#x2e1b;", "&#x2e1c;", "&#x2e1d;", "&#x2e1e;", "&#x2e1f;", "&#x2e20;", "&#x2e21;", "&#x2e22;", "&#x2e23;", "&#x2e24;", "&#x2e25;", "&#x2e26;", "&#x2e27;", "&#x2e28;", "&#x2e29;", "&#x2e2a;", "&#x2e2b;", "&#x2e2c;", "&#x2e2d;", "&#x2e2e;", "&#x2e2f;", "&#x2e30;", "&#x2e31;", "&#x2e32;", "&#x2e33;", "&#x2e34;", "&#x2e35;", "&#x2e36;", "&#x2e37;", "&#x2e38;", "&#x2e39;", "&#x2e3a;", "&#x2e3b;", "&#x2e3c;", "&#x2e3d;", "&#x2e3e;", "&#x2e3f;", "&#x2e40;", "&#x2e41;", "&#x2e42;", "&#x2e43;", "&#x2e44;", "&#x2e45;", "&#x2e46;", "&#x2e47;", "&#x2e48;", "&#x2e49;", "&#x2e4a;", "&#x2e4b;", "&#x2e4c;", "&#x2e4d;", "&#x2e4e;", "&#x2e4f;", "&#x2e50;", "&#x2e51;", "&#x2e52;", "&#xa640;", "&#xa641;", "&#xa642;", "&#xa643;", "&#xa644;", "&#xa645;", "&#xa646;", "&#xa647;", "&#xa648;", "&#xa649;", "&#xa64a;", "&#xa64b;", "&#xa64c;", "&#xa64d;", "&#xa64e;", "&#xa64f;", "&#xa650;", "&#xa651;", "&#xa652;", "&#xa653;", "&#xa654;", "&#xa655;", "&#xa656;", "&#xa657;", "&#xa658;", "&#xa659;", "&#xa65a;", "&#xa65b;", "&#xa65c;", "&#xa65d;", "&#xa65e;", "&#xa65f;", "&#xa660;", "&#xa661;", "&#xa662;", "&#xa663;", "&#xa664;", "&#xa665;", "&#xa666;", "&#xa667;", "&#xa668;", "&#xa669;", "&#xa66a;", "&#xa66b;", "&#xa66c;", "&#xa66d;", "&#xa66e;", "&#xa66f;", "&#xa670;", "&#xa671;", "&#xa672;", "&#xa673;", "&#xa674;", "&#xa675;", "&#xa676;", "&#xa677;", "&#xa678;", "&#xa679;", "&#xa67a;", "&#xa67b;", "&#xa67c;", "&#xa67d;", "&#xa67e;", "&#xa67f;", "&#xa680;", "&#xa681;", "&#xa682;", "&#xa683;", "&#xa684;", "&#xa685;", "&#xa686;", "&#xa687;", "&#xa688;", "&#xa689;", "&#xa68a;", "&#xa68b;", "&#xa68c;", "&#xa68d;", "&#xa68e;", "&#xa68f;", "&#xa690;", "&#xa691;", "&#xa692;", "&#xa693;", "&#xa694;", "&#xa695;", "&#xa696;", "&#xa697;", "&#xa698;", "&#xa699;", "&#xa69a;", "&#xa69b;", "&#xa69c;", "&#xa69d;", "&#xa69e;", "&#xa69f;", "&#xa700;", "&#xa701;", "&#xa702;", "&#xa703;", "&#xa704;", "&#xa705;", "&#xa706;", "&#xa707;", "&#xa708;", "&#xa709;", "&#xa70a;", "&#xa70b;", "&#xa70c;", "&#xa70d;", "&#xa70e;", "&#xa70f;", "&#xa710;", "&#xa711;", "&#xa712;", "&#xa713;", "&#xa714;", "&#xa715;", "&#xa716;", "&#xa717;", "&#xa718;", "&#xa719;", "&#xa71a;", "&#xa71b;", "&#xa71c;", "&#xa71d;", "&#xa71e;", "&#xa71f;", "&#xa720;", "&#xa721;", "&#xa722;", "&#xa723;", "&#xa724;", "&#xa725;", "&#xa726;", "&#xa727;", "&#xa728;", "&#xa729;", "&#xa72a;", "&#xa72b;", "&#xa72c;", "&#xa72d;", "&#xa72e;", "&#xa72f;", "&#xa730;", "&#xa731;", "&#xa732;", "&#xa733;", "&#xa734;", "&#xa735;", "&#xa736;", "&#xa737;", "&#xa738;", "&#xa739;", "&#xa73a;", "&#xa73b;", "&#xa73c;", "&#xa73d;", "&#xa73e;", "&#xa73f;", "&#xa740;", "&#xa741;", "&#xa742;", "&#xa743;", "&#xa744;", "&#xa745;", "&#xa746;", "&#xa747;", "&#xa748;", "&#xa749;", "&#xa74a;", "&#xa74b;", "&#xa74c;", "&#xa74d;", "&#xa74e;", "&#xa74f;", "&#xa750;", "&#xa751;", "&#xa752;", "&#xa753;", "&#xa754;", "&#xa755;", "&#xa756;", "&#xa757;", "&#xa758;", "&#xa759;", "&#xa75a;", "&#xa75b;", "&#xa75c;", "&#xa75d;", "&#xa75e;", "&#xa75f;", "&#xa760;", "&#xa761;", "&#xa762;", "&#xa763;", "&#xa764;", "&#xa765;", "&#xa766;", "&#xa767;", "&#xa768;", "&#xa769;", "&#xa76a;", "&#xa76b;", "&#xa76c;", "&#xa76d;", "&#xa76e;", "&#xa76f;", "&#xa770;", "&#xa771;", "&#xa772;", "&#xa773;", "&#xa774;", "&#xa775;", "&#xa776;", "&#xa777;", "&#xa778;", "&#xa779;", "&#xa77a;", "&#xa77b;", "&#xa77c;", "&#xa77d;", "&#xa77e;", "&#xa77f;", "&#xa780;", "&#xa781;", "&#xa782;", "&#xa783;", "&#xa784;", "&#xa785;", "&#xa786;", "&#xa787;", "&#xa788;", "&#xa789;", "&#xa78a;", "&#xa78b;", "&#xa78c;", "&#xa78d;", "&#xa78e;", "&#xa78f;", "&#xa790;", "&#xa791;", "&#xa792;", "&#xa793;", "&#xa794;", "&#xa795;", "&#xa796;", "&#xa797;", "&#xa798;", "&#xa799;", "&#xa79a;", "&#xa79b;", "&#xa79c;", "&#xa79d;", "&#xa79e;", "&#xa79f;", "&#xa7a0;", "&#xa7a1;", "&#xa7a2;", "&#xa7a3;", "&#xa7a4;", "&#xa7a5;", "&#xa7a6;", "&#xa7a7;", "&#xa7a8;", "&#xa7a9;", "&#xa7aa;", "&#xa7ab;", "&#xa7ac;", "&#xa7ad;", "&#xa7ae;", "&#xa7af;", "&#xa7b0;", "&#xa7b1;", "&#xa7b2;", "&#xa7b3;", "&#xa7b4;", "&#xa7b5;", "&#xa7b6;", "&#xa7b7;", "&#xa7b8;", "&#xa7b9;", "&#xa7ba;", "&#xa7bb;", "&#xa7bc;", "&#xa7bd;", "&#xa7be;", "&#xa7bf;", "&#xa7c2;", "&#xa7c3;", "&#xa7c4;", "&#xa7c5;", "&#xa7c6;", "&#xa7c7;", "&#xa7c8;", "&#xa7c9;", "&#xa7ca;", "&#xa7f5;", "&#xa7f6;", "&#xa7f7;", "&#xa7f8;", "&#xa7f9;", "&#xa7fa;", "&#xa7fb;", "&#xa7fc;", "&#xa7fd;", "&#xa7fe;", "&#xa7ff;", "&#xa830;", "&#xa831;", "&#xa832;", "&#xa833;", "&#xa834;", "&#xa835;", "&#xa836;", "&#xa837;", "&#xa838;", "&#xa839;", "&#xa8e0;", "&#xa8e1;", "&#xa8e2;", "&#xa8e3;", "&#xa8e4;", "&#xa8e5;", "&#xa8e6;", "&#xa8e7;", "&#xa8e8;", "&#xa8e9;", "&#xa8ea;", "&#xa8eb;", "&#xa8ec;", "&#xa8ed;", "&#xa8ee;", "&#xa8ef;", "&#xa8f0;", "&#xa8f1;", "&#xa8f2;", "&#xa8f3;", "&#xa8f4;", "&#xa8f5;", "&#xa8f6;", "&#xa8f7;", "&#xa8f8;", "&#xa8f9;", "&#xa8fa;", "&#xa8fb;", "&#xa8fc;", "&#xa8fd;", "&#xa8fe;", "&#xa8ff;", "&#xa92e;", "&#xab30;", "&#xab31;", "&#xab32;", "&#xab33;", "&#xab34;", "&#xab35;", "&#xab36;", "&#xab37;", "&#xab38;", "&#xab39;", "&#xab3a;", "&#xab3b;", "&#xab3c;", "&#xab3d;", "&#xab3e;", "&#xab3f;", "&#xab40;", "&#xab41;", "&#xab42;", "&#xab43;", "&#xab44;", "&#xab45;", "&#xab46;", "&#xab47;", "&#xab48;", "&#xab49;", "&#xab4a;", "&#xab4b;", "&#xab4c;", "&#xab4d;", "&#xab4e;", "&#xab4f;", "&#xab50;", "&#xab51;", "&#xab52;", "&#xab53;", "&#xab54;", "&#xab55;", "&#xab56;", "&#xab57;", "&#xab58;", "&#xab59;", "&#xab5a;", "&#xab5b;", "&#xab5c;", "&#xab5d;", "&#xab5e;", "&#xab5f;", "&#xab60;", "&#xab61;", "&#xab62;", "&#xab63;", "&#xab64;", "&#xab65;", "&#xab66;", "&#xab67;", "&#xab68;", "&#xab69;", "&#xab6a;", "&#xab6b;", "&#xfb00;", "&#xfb01;", "&#xfb02;", "&#xfb03;", "&#xfb04;", "&#xfb05;", "&#xfb06;", "&#xfe00;", "&#xfe20;", "&#xfe21;", "&#xfe22;", "&#xfe23;", "&#xfe24;", "&#xfe25;", "&#xfe26;", "&#xfe27;", "&#xfe28;", "&#xfe29;", "&#xfe2a;", "&#xfe2b;", "&#xfe2c;", "&#xfe2d;", "&#xfe2e;", "&#xfe2f;", "&#xfeff;", "&#xfffc;", "&#xfffd;"]

