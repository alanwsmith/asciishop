let s = {
  layers: [],
  current: {
    layer: null,
    row: null,
    col: null
  },
  selected: {
    row: null,
    col: null,
  },
  rows: 80,
  cols: 80,
  visibleLayers: []

  // tables: [],
  // currentTable: 0,
  // current.col: 0,
  // current.row: 0,
  // selected.col: null,
  // selected.row: null,
  // selectedChars: [],
  // cols: 80,
  // rows: 80,
  // freqChars: [],
  // visibleLayers: [],
}


const handleCanvasClick = (event) => {
  const data = event.srcElement.dataset
  console.log(event)
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
  s.layers[s.current.layer][s.current.row][s.current.col] = event.srcElement.innerText
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
    // } else if (findArrayInArray(s.selectedChars, [c, r])) {
    // return true
  } else {
    return false
  }
}

const loadFile = () => {
  console.log("loadFile")
  const reader = new FileReader()
  const theFile = loadButton.files[0]
  reader.onload = function(e) {
    const rawFileData = e.target.result
    const layers = rawFileData.split("ASCIISHOPLAYER\n")
    s.visibleLayers = []
    s.layers = []
    layers.forEach((layer, layerIndex) => {
      if (layerIndex !== 0) {
        const newLayer = []
        const rows = layer.split("\n")
        rows.forEach((row, rowIndex) => {
          const newRow = []
          const chars = row.split("")
          chars.forEach((char) => {
            newRow.push(char)
          })
          newLayer.push(newRow)
        })
        s.layers.push(newLayer)
        s.visibleLayers.push(true)
      }
    })
    s.current.layer = s.layers.length - 1
    render()
  }
  reader.readAsText(theFile)
  buildCanvas(80, 80)
}


const buildCanvas = (rows, cols) => {
  const tableFrame = document.createElement("table")
  tableFrame.id = "canvas"
  for (let r = 0; r <= rows; r++) {
    const tableRow = document.createElement("tr")
    for (let c = 0; c <= cols; c++) {
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
  bg.appendChild(tableFrame)
  canvas.addEventListener("click", handleCanvasClick)
}

const render = () => {
  while (layerToggles.children.length > 0) {
    layerToggles.children[0].remove()
  }
  for (let r = 0; r <= s.rows; r++) {
    for (let c = 0; c <= s.cols; c++) {
      document.getElementById(`cell_${r}_${c}`).innerHTML = " "
    }
  }


  s.layers.forEach((layer, layerIndex) => {
    const layerToggle = document.createElement("input")
    layerToggle.type = "checkbox"
    layerToggle.dataset.layer = layerIndex
    layerToggle.addEventListener("change", toggleLayer)
    layerToggles.appendChild(layerToggle)


    if (s.visibleLayers[layerIndex]) {
      layerToggle.checked = true
      layer.forEach((row, rowIndex) => {
        row.forEach((char, charIndex) => {
          const theCell = document.getElementById(`cell_${rowIndex}_${charIndex}`)
          theCell.innerHTML = char
          if (s.current.layer === layerIndex && char !== " ") {
            theCell.classList.add("activeLayer")
          }
        })
      })
    }
  })
}

const toggleLayer = (event) => {
  const el = event.srcElement
  console.log(event)
  console.log(event.srcElement.checked)
  if (el.checked) {
    s.visibleLayers[parseInt(el.dataset.layer, 10)] = true
  } else {
    s.visibleLayers[parseInt(el.dataset.layer, 10)] = false
  }
  render()
}

const updateOtherCharacters = (char) => {
  for (let r = 0; r <= s.rows; r++) {
    for (let c = 0; c <= s.cols; c++) {
      if (isPixelSelected(r, c)) {
        s.layers[s.current.layer][r][c] = char
      }
    }
  }
}

const updateStyles = () => {
  for (let r = 0; r < s.rows; r++) {
    for (let c = 0; c < s.cols; c++) {
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
  currentPixel.classList.remove("inactivePixel")
  currentPixel.classList.add("activePixel")
}


document.addEventListener("DOMContentLoaded", () => {
  // bg.addEventListener("click", handlePixelClick)
  charContainer.addEventListener("click", handleCharClick)
  // duplicateButton.addEventListener("click", duplicateLayer)
  // layerSelects.addEventListener("click", handleSelectClick)
  loadButton.addEventListener("change", loadFile)
  // saveButton.addEventListener("click", saveFile)
  // document.addEventListener("keydown", keydownHandler)
})


// const duplicateLayer = () => {
//   if (s.tables[s.currentTable] !== undefined) {
//     const newTable = JSON.parse(JSON.stringify(s.tables[s.currentTable]))
//     s.tables.splice(s.currentTable + 1, 0, newTable)
//     console.log(newTable)
//   }
// }

// const findArrayInArray = (container, target) => {
//   return container.some((el) => {
//     return target.every((t, tIndex) => {
//       if (el[tIndex] === t) {
//         return true
//       } else {
//         return false
//       }
//     })
//   })
// }


// const handlePixelClick = (event) => {
//   console.log(event)
//   let data = event.srcElement.dataset
//   if (event.shiftKey == true) {
//     s.selectedChars = []
//     s.selected.col = s.current.col
//     s.selected.row = s.current.row
//     s.current.col = parseInt(data.col, 10)
//     s.current.row = parseInt(data.row, 10)
//   } else if (event.metaKey == true) {
//     s.selectedChars.push([s.current.col, s.current.row])
//     s.selected.col = null
//     s.selected.row = null
//     s.current.col = parseInt(data.col, 10)
//     s.current.row = parseInt(data.row, 10)
//     // debugger
//   } else {
//     s.selectedChars = []
//     s.selected.col = null
//     s.selected.row = null
//     s.current.col = parseInt(data.col, 10)
//     s.current.row = parseInt(data.row, 10)
//   }
//   updateStyles()
// }

// const handleSelectClick = (event) => {
//   const layerTarget = parseInt(event.srcElement.dataset.layer, 10)
//   s.currentTable = layerTarget
//   cStatus()
//   renderLayers()
// }


// const keydownHandler = (event) => {
//   // console.log(event)
//   if (event.code === "KeyA" && event.metaKey === false) {
//     event.preventDefault()
//     if (s.current.col != 0) {
//       s.current.col = s.current.col - 1
//     }
//     // renderLayers()
//      updateStyles()
//   } else if (event.code === "KeyD" && event.metaKey === false) {
//     event.preventDefault()
//     if (s.current.col < s.cols - 1) {
//       s.current.col = s.current.col + 1
//     }
//     // renderLayers()
//      updateStyles()
//   } else if (event.code === "KeyW" && event.metaKey === false) {
//     event.preventDefault()
//     if (s.current.row != 0) {
//       s.current.row = s.current.row - 1
//     }
//     // renderLayers()
//      updateStyles()
//   } else if (event.code === "KeyS" && event.metaKey === false) {
//     event.preventDefault()
//     if (s.current.row < s.rows - 1) {
//       s.current.row = s.current.row + 1
//     }
//     // renderLayers()
//      updateStyles()
//   } else if (event.code === "KeyF" && event.metaKey === false) {
//     event.preventDefault()
//     s.tables[s.currentTable][s.current.row][s.current.col] = " "
//     updateOtherCharacters(" ")
//      renderLayers()
//   }
// }

// const layerToggleHandler = (event) => {
//   s.visibleLayers[event.srcElement.dataset.layer] = !s.visibleLayers[event.srcElement.dataset.layer]
//      updateStyles()
//   // renderLayers()
// }

// const makeLayerControls = (layerIndex) => {
//   // console.log(layerIndex)
//   const layerSelect = document.createElement("div")
//   layerSelect.innerHTML = `<button class="selectLayer" data-layer="${layerIndex}">Select Layer ${layerIndex}</button>`
//   return layerSelect
// }

// const renderLayers = () => {
//   const l = s.tables.length
//   while (bg.children.length > 0) {
//     bg.children[0].remove()
//   }
//   while (layerToggles.children.length > 0) {
//     layerToggles.children[0].remove()
//   }
//   while (layerSelects.children.length > 0) {
//     layerSelects.children[0].remove()
//   }
//   s.tables.forEach((table, tableIndex) => {
//     let renderTable = document.createElement("table")
//     let layerToggle = document.createElement("input")
//     layerToggle.type = "checkbox"
//     layerToggle.dataset.layer = tableIndex
//     layerToggle.addEventListener("change", layerToggleHandler)
//     if (s.visibleLayers[tableIndex]) {
//       layerToggle.checked = true;
//     }
//     layerToggles.appendChild(layerToggle)
//     layerSelects.appendChild(makeLayerControls(tableIndex))
//     renderTable.classList.add("layerTable")
//     if (tableIndex == s.currentTable) {
//       renderTable.classList.add("activeTable")
//     } else {
//       renderTable.classList.add("inactiveTable")
//     }
//     for (let r = 0; r < s.rows; r++) {
//       let tableRow = document.createElement("tr")
//       renderTable.appendChild(tableRow)
//       if (s.tables[tableIndex][r] === undefined) {
//         s.tables[tableIndex][r] = []
//       }
//       for (let c = 0; c < s.cols; c++) {
//         let tableCell = document.createElement("td")
//         tableCell.classList.add("pixelCell")
//         let cellButton = document.createElement("button")
//         cellButton.dataset.row = r
//         cellButton.dataset.col = c
//         cellButton.id = `t${tableIndex}_r${r}_c${c}`
//         if (s.tables[tableIndex][r][c] === undefined) {
//           s.tables[tableIndex][r][c] = " "
//         }
//         if (s.visibleLayers[tableIndex]) {
//           cellButton.innerHTML = s.tables[tableIndex][r][c]
//         }
//         cellButton.classList.add("pixel")
//         tableCell.appendChild(cellButton)
//         tableRow.appendChild(tableCell)
//       }
//     }
//     bg.appendChild(renderTable)
//   })
//   updateStyles()
// }

// const saveFile = () => {
//   console.log("saving 2")
//   let savedata = ""
//   s.tables.forEach((t) => {
//     savedata += "ASCIISHOPLAYER\n"
//     t.forEach((r) => {
//       r.forEach((c) => {
//         savedata += c
//       })
//       savedata += "\n"
//     })
//   })
//   const data = new Blob(
//     [savedata],
//     { type: "application/octet-stream" }
//   )
//   const link = document.createElement("a")
//   link.href = URL.createObjectURL(data)
//   link.setAttribute("download", "ascii-shop.txt");
//   link.click()
// }

