#!/usr/bin/env python3

import json

new_data = {
    "metadata": {
        "rows": 29,
        "cols": 80
    },
    "layers": []
}

with open("input.json") as _in:
    data = json.load(_in)
    for l in data:
        layer = {
            "details": {},
            "rows": []
        }
        for r in l:
            row = []
            for c in r:
                row.append({"char": c, "hex_color": "#aa00aa"})

            for ci in range(len(row), new_data["metadata"]["cols"]):
                row.append({"char": " ", "hex_color": "#aa00aa"})

            layer["rows"].append(row)
        new_data["layers"].append(layer)

    print(len(new_data["layers"][0]["rows"]))
    with open("output.json", "w") as _out:
        json.dump(new_data, _out, sort_keys=True, indent=2, default=str)

print("Process Finished")
