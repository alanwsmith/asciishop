#!/usr/bin/env python3

from bs4 import BeautifulSoup

print("Running.")

with open("output.html", "w") as _out:
    with open("chars.html") as _in:
        soup = BeautifulSoup(_in, 'html.parser')
        rows = soup.find_all('tr')
        for row in rows:
            atag = row.find("a")
            if atag:
                _out.write(f'<pre class="char">&#x{atag.text};</pre>')
                _out.write("\n")
