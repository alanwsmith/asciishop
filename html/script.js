let s = {
  layers: [],
  current: {
    layer: null,
    row: null,
    col: null
  }

  // tables: [],
  // currentTable: 0,
  // currentCol: 0,
  // currentRow: 0,
  // selectedCol: null,
  // selectedRow: null,
  // selectedChars: [],
  // cols: 80,
  // rows: 80,
  // freqChars: [],
  // visibleLayers: [],
}

// const cStatus = () => {
//   console.log(`${s.currentTable} - ${s.currentRow} - ${s.currentCol}`)
// }

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

// const handleCharClick = (event) => {
//   cStatus()
//   // console.log(event.srcElement.innerText)
//   s.tables[s.currentTable][s.currentRow][s.currentCol] = event.srcElement.innerText
//   updateOtherCharacters(event.srcElement.innerText)
//   renderLayers()
// }

// const handlePixelClick = (event) => {
//   console.log(event)
//   let data = event.srcElement.dataset
//   if (event.shiftKey == true) {
//     s.selectedChars = []
//     s.selectedCol = s.currentCol
//     s.selectedRow = s.currentRow
//     s.currentCol = parseInt(data.col, 10)
//     s.currentRow = parseInt(data.row, 10)
//   } else if (event.metaKey == true) {
//     s.selectedChars.push([s.currentCol, s.currentRow])
//     s.selectedCol = null
//     s.selectedRow = null
//     s.currentCol = parseInt(data.col, 10)
//     s.currentRow = parseInt(data.row, 10)
//     // debugger
//   } else {
//     s.selectedChars = []
//     s.selectedCol = null
//     s.selectedRow = null
//     s.currentCol = parseInt(data.col, 10)
//     s.currentRow = parseInt(data.row, 10)
//   }
//   updateStyles()
// }

// const handleSelectClick = (event) => {
//   const layerTarget = parseInt(event.srcElement.dataset.layer, 10)
//   s.currentTable = layerTarget
//   cStatus()
//   renderLayers()
// }

// const isPixelSelected = (r, c) => {
//   // console.log(s.selectedChars)
//   if (s.selectedCol !== null) {
//     let turnItOn = 0
//     if (r >= s.selectedRow && r <= s.currentRow) {
//       turnItOn += 1
//     } else if (r >= s.currentRow && r <= s.selectedRow) {
//       turnItOn += 1
//     }
//     if (c >= s.selectedCol && c <= s.currentCol) {
//       turnItOn += 1
//     } else if (c >= s.currentCol && c <= s.selectedCol) {
//       turnItOn += 1
//     }
//     if (turnItOn === 2) {
//       return true
//     }
//   } else if (findArrayInArray(s.selectedChars, [c, r])) {
//     return true
//   } else {
//     return false
//   }
// }

// const keydownHandler = (event) => {
//   // console.log(event)
//   if (event.code === "KeyA" && event.metaKey === false) {
//     event.preventDefault()
//     if (s.currentCol != 0) {
//       s.currentCol = s.currentCol - 1
//     }
//     // renderLayers()
//      updateStyles()
//   } else if (event.code === "KeyD" && event.metaKey === false) {
//     event.preventDefault()
//     if (s.currentCol < s.cols - 1) {
//       s.currentCol = s.currentCol + 1
//     }
//     // renderLayers()
//      updateStyles()
//   } else if (event.code === "KeyW" && event.metaKey === false) {
//     event.preventDefault()
//     if (s.currentRow != 0) {
//       s.currentRow = s.currentRow - 1
//     }
//     // renderLayers()
//      updateStyles()
//   } else if (event.code === "KeyS" && event.metaKey === false) {
//     event.preventDefault()
//     if (s.currentRow < s.rows - 1) {
//       s.currentRow = s.currentRow + 1
//     }
//     // renderLayers()
//      updateStyles()
//   } else if (event.code === "KeyF" && event.metaKey === false) {
//     event.preventDefault()
//     s.tables[s.currentTable][s.currentRow][s.currentCol] = " "
//     updateOtherCharacters(" ")
//      renderLayers()
//   }
// }

// const layerToggleHandler = (event) => {
//   s.visibleLayers[event.srcElement.dataset.layer] = !s.visibleLayers[event.srcElement.dataset.layer]
//      updateStyles()
//   // renderLayers()
// }

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
}

// const makeLayerControls = (layerIndex) => {
//   // console.log(layerIndex)
//   const layerSelect = document.createElement("div")
//   layerSelect.innerHTML = `<button class="selectLayer" data-layer="${layerIndex}">Select Layer ${layerIndex}</button>`
//   return layerSelect
// }



const render = () => {
  const tableFrame = document.createElement("table")
  for (let r = 0; r <= 80; r ++) {
    const tableRow = document.createElement("tr")
    for (let c = 0; c <= 80; c ++) {
      const tableCell = document.createElement("td")
      tableCell.id = `cell_${r}_${c}`
      tableCell.innerHTML = ""
      tableRow.appendChild(tableCell)
    }
    tableFrame.appendChild(tableRow)
  }

  bg.appendChild(tableFrame)

  s.layers.forEach((layer) => {
    layer.forEach((row, rowIndex) => {
      row.forEach((char, charIndex) => {
        const id = `cell_${rowIndex}_${charIndex}`
         document.getElementById(`cell_${rowIndex}_${charIndex}`).innerHTML = char
      })
    })
  })
}




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

// const updateOtherCharacters = (char) => {
//   for (let r = 0; r <= s.rows; r++) {
//     for (let c = 0; c <= s.cols; c++) {
//       if (isPixelSelected(r, c)) {
//         s.tables[s.currentTable][r][c] = char
//       }
//     }
//   }
// }

// const updateStyles = () => {
//   const upperIndex = s.tables.length - 1
//   s.tables[upperIndex].forEach((r, rIndex) => {
//     // debugger
//     r.forEach((c, cIndex) => {
//       const theId = `t${upperIndex}_r${rIndex}_c${cIndex}`
//       const el = document.getElementById(theId)
//       if (el !== null) {
//         el.classList.remove("activePixel")
//         el.classList.remove("selectedPixels")
//         if (rIndex === s.currentRow && cIndex === s.currentCol) {
//           el.classList.add("activePixel")
//         } else {
//           if (isPixelSelected(rIndex, cIndex)) {
//             el.classList.add("selectedPixels")
//           }
//         }
//       }
//     })
//   })
// }


document.addEventListener("DOMContentLoaded", () => {
  // bg.addEventListener("click", handlePixelClick)
  // charContainer.addEventListener("click", handleCharClick)
  // duplicateButton.addEventListener("click", duplicateLayer)
  // layerSelects.addEventListener("click", handleSelectClick)
  loadButton.addEventListener("change", loadFile)
  // saveButton.addEventListener("click", saveFile)
  // document.addEventListener("keydown", keydownHandler)
})
