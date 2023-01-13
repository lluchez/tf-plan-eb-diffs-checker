// NOTE: regexp created here: https://regex101.com/r/sKZjA8/1
const PARSING_REGEXP = /\s(?<type>[\+\-])\s+setting\s\{\s+[\+\-]\sname\s+=\s\"(?<name>[^"]+)\"(?:\s\->\snull)?\s+[\+\-]\snamespace\s=\s\"[^"]+\"(?:\s\->\snull)?\s+[\+\-]\svalue\s+=\s\"(?<value>[^"]+)\"(?:\s\->\snull)?/g;


function parseText(text) {
  const listedProps = new Set(), newProps = [], prevProps = [];
  for (const match of text.matchAll(PARSING_REGEXP)) {
    const g = match.groups, type = g['type'], name = g['name'], value = g['value'], list = type == '-' ? prevProps : newProps;
    listedProps.add(name);
    list[name] = value;
  }
  const allDiffs = [];
  for (const propName of listedProps) {
    allDiffs.push({
      name: propName,
      oldValue: prevProps[propName],
      newValue: newProps[propName]
    })
  }
  return allDiffs;
}

function addRowToTable(table, cellsText) {
  const row = table.insertRow(-1);
  cellsText.forEach(text => addCellToRow(row, text));
}

function addCellToRow(row, text) {
  const cell = row.insertCell(-1);
  cell.innerHTML = `<pre>${text}</pre>`;
}

function setNoDiffRow(table, text) {
  table.innerHTML = `<tr><td colspan="3" class="no-results">${text}</td></tr>`;
}

function handleTerraformPlanChanged(event) {
  const allProps = parseText(event.target.value);
  const diffProps = allProps.filter(x => x.oldValue != x.newValue);
  const resultsTableBody = document.getElementById('results').getElementsByTagName('tbody')[0];
  if (diffProps.length) {
    resultsTableBody.innerHTML = ''; // clear old rows
    diffProps.forEach(({name, oldValue, newValue}) => addRowToTable(resultsTableBody, [name, oldValue, newValue]))
  }
  else if (allProps.length) {
    setNoDiffRow(resultsTableBody, `Valid plan entered (${allProps.length} props found), but no differences found`);
  } else {
    setNoDiffRow(resultsTableBody, 'Please enter a valid TF plan');
  }
}

window.addEventListener("load", () => {
  const textbox = document.getElementById('diffs');
  textbox.addEventListener('keyup', handleTerraformPlanChanged);
  textbox.focus();
});

