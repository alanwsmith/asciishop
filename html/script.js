let s = {
  tables: [],
  currentTable: 0,
  currentCol: 0,
  currentRow: 0,
  cols: 80,
  rows: 80,
  selectCoord: { t: null, r: null, c: null },
  freqChars: [],
  visibleLayers: [],
}

const cStatus = () => {
  console.log(`${s.currentTable} - ${s.currentRow} - ${s.currentCol}`)
}

const makeLayerControls = (layerIndex) => {
  console.log(layerIndex)
  const layerSelect = document.createElement("div")
  layerSelect.innerHTML = `<button class="selectLayer" data-layer="${layerIndex}">Select Layer ${layerIndex}</button>`
  return layerSelect
}

const addCharacter = (event) => {
  console.log("addCharacter")
}

const exportAscii = () => {
  let outputTable = []
  for (let c = 0; c < s.rows; c++) {
    let row = []
    for (let r = 0; r < s.cols; r++) {
      row.push(" ")
    }
    outputTable.push(row)
  }
  console.log(outputTable)
  s.tables.forEach((t, tIndex) => {
    t.forEach((c, cIndex) => {
      c.forEach((r, rIndex) => {
        if (r !== " ") {
          if (s.visibleLayers[tIndex] === true) {
            outputTable[rIndex][cIndex] = r
          }
        }
      })
    })
  })

  let output = ""

  outputTable.forEach((r, rIndex) => {
    r.forEach((c, cIndex) => {
      output += c
    })
    output += "\n"
  })

  copyArea.innerText = output

}

const getId = () => {
  return `t${s.currentTable}_c${s.currentCol}_r${s.currentRow}`
}

const handleCharClick = (event) => {
  cStatus()
  console.log(event.srcElement.innerText)
  s.tables[s.currentTable][s.currentCol][s.currentRow] = event.srcElement.innerText
  renderLayers()
}

const handlePixelClick = (event) => {
  console.log("pixel click")
  let data = event.srcElement.dataset
  s.currentCol = parseInt(data.col, 10)
  s.currentRow = parseInt(data.row, 10)
  cStatus()
  updateStyles()
}

const handleSelectClick = (event) => {
  const layerTarget = parseInt(event.srcElement.dataset.layer, 10)
  s.currentTable = layerTarget
  cStatus()
  renderLayers()
}

const importAscii = () => {
  console.log("importAscii")
  // build the base table to ensure it's full
  let newTable = []
  console.log(s.cols)
  for (let c = 0; c <= s.cols; c += 1) {
    console.log("-")
    let newCol = []
    for (let r = 0; r <= s.rows; r += 1) {
      newCol.push(" ")
      console.log("x")
    }
    newTable.push(newCol)
  }
  // then populate it
  let rows = copyArea.innerText.split("\n")
  console.log(rows)
  rows.forEach((row, rowIndex) => {
    let cols = row.split("")
    cols.forEach((char, colIndex) => {
      newTable[colIndex][rowIndex] = char
    })
  })
  s.tables.push(newTable)
  s.visibleLayers.push(true)
  s.currentTable = s.tables.length - 1
  renderLayers()
}

const keydownHandler = (event) => {
  console.log(event)
  cStatus()
  if (event.code === "KeyA" && event.metaKey === false) {
    event.preventDefault()
    if (s.currentCol != 0) {
      s.currentCol = s.currentCol - 1
    }
    cStatus()
    renderLayers()
  } else if (event.code === "KeyD" && event.metaKey === false) {
    event.preventDefault()
    if (s.currentCol < s.cols - 1) {
      s.currentCol = s.currentCol + 1
    }
    cStatus()
    renderLayers()
  } else if (event.code === "KeyW" && event.metaKey === false) {
    event.preventDefault()
    if (s.currentRow != 0) {
      s.currentRow = s.currentRow - 1
    }
    cStatus()
    renderLayers()
  } else if (event.code === "KeyS" && event.metaKey === false) {
    event.preventDefault()
    if (s.currentRow < s.rows - 1) {
      s.currentRow = s.currentRow + 1
    }
    cStatus()
    renderLayers()
  } else if (event.code === "KeyF" && event.metaKey === false) {
    event.preventDefault()
    s.tables[s.currentTable][s.currentCol][s.currentRow] = " "
    cStatus()
    renderLayers()
  }
  cStatus()
}

const layerToggleHandler = (event) => {
  console.log(event.srcElement)
  console.log(event.srcElement.dataset.layer)
  s.visibleLayers[event.srcElement.dataset.layer] = !s.visibleLayers[event.srcElement.dataset.layer]
  console.log(s.visibleLayers)
  renderLayers()
}

const prepChars = () => {
  console.log("prepChars")
  const chars = document.getElementsByClassName("char")
  for (c = 0; c < chars.length; c += 1) {
    chars[c].addEventListener("click", addCharacter)
  }
}

const renderLayers = () => {
  const l = s.tables.length
  console.log("renderLayers")
  while (bg.children.length > 0) {
    bg.children[0].remove()
  }
  while (layerToggles.children.length > 0) {
    layerToggles.children[0].remove()
  }
  while (layerSelects.children.length > 0) {
    layerSelects.children[0].remove()
  }

  s.tables.forEach((table, tableIndex) => {
    let renderTable = document.createElement("table")
    let layerToggle = document.createElement("input")
    layerToggle.type = "checkbox"
    layerToggle.dataset.layer = tableIndex
    layerToggle.addEventListener("change", layerToggleHandler)
    if (s.visibleLayers[tableIndex]) {
      layerToggle.checked = true;
    }
    layerToggles.appendChild(layerToggle)
    layerSelects.appendChild(makeLayerControls(tableIndex))

    renderTable.classList.add("layerTable")
    if (tableIndex == s.currentTable) {
      renderTable.classList.add("activeTable")
    } else {
      renderTable.classList.add("inactiveTable")
    }
    for (let r = 0; r < s.rows; r++) {
      let tableRow = document.createElement("tr")
      renderTable.appendChild(tableRow)
      for (let c = 0; c < s.cols; c++) {
        let tableCell = document.createElement("td")
        tableCell.classList.add("pixelCell")
        let cellButton = document.createElement("button")
        cellButton.dataset.row = r
        cellButton.dataset.col = c

        cellButton.id = `t${tableIndex}_c${c}_r${r}`
        if (s.visibleLayers[tableIndex]) {
          cellButton.innerHTML = s.tables[tableIndex][c][r]
        }
        cellButton.classList.add("pixel")
        tableCell.appendChild(cellButton)
        tableRow.appendChild(tableCell)
      }
    }
    bg.appendChild(renderTable)
  })
  updateStyles()
}

updateStyles = () => {
  const upperIndex = s.tables.length - 1
  s.tables[upperIndex].forEach((r, rIndex) => {
    r.forEach((c, cIndex) => {
      const theId = `t${upperIndex}_c${cIndex}_r${rIndex}`
      const el = document.getElementById(theId)
      if (el !== null) {
        if (cIndex === s.currentCol && rIndex === s.currentRow) {
          cStatus()
          el.classList.add("activePixel")
        } else {
          el.classList.remove("activePixel")
        }
      }
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  bg.addEventListener("click", handlePixelClick)
  layerSelects.addEventListener("click", handleSelectClick)
  charContainer.addEventListener("click", handleCharClick)
  importButton.addEventListener("click", importAscii)
  exportButton.addEventListener("click", exportAscii)
  document.addEventListener("keydown", keydownHandler)
  prepChars()
})
