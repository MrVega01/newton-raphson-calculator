import inquirer from 'inquirer'

// Ejemplo de valores
// formula = [1, 'x', 3, '-', 2, 'x', 1, '+', 1, '', 1]
// formulaDerived = [3, 'x', 2, '-', 2, '', 1]
// startPoint = -1.5
// errorTolerance = 0.00001

(async () => {
  console.log('Inserte la función')
  const formula = await getData()
  console.log('Inserte la derivada de la función')
  const formulaDerived = await getData()
  const startPoint = Number(Object.values(await inquirer.prompt([
    {
      name: 'Inserte el punto de inicio',
      validate: validateAnswer
    }
  ]).catch(e => console.error(e)))[0])
  const errorTolerance = Number(Object.values(await inquirer.prompt([
    {
      name: 'Inserte el la tolerancia de error',
      validate: validateAnswer
    }
  ]).catch(e => console.error(e)))[0])

  let error = 100
  let x = null
  let i = 0

  while (error > errorTolerance) {
    x = (x !== null) ? x : startPoint
    const formulaValue = resolveFormulaByValue(formula, x)
    const formulaDerivedValue = resolveFormulaByValue(formulaDerived, x)
    const newX = findX(x, formulaValue, formulaDerivedValue)
    error = calculateRelativeError(newX, x)
    x = newX

    console.log(`f(x): ${formulaValue}\nf(x)': ${formulaDerivedValue}\nx${i}: ${x}\nError relativo: ${error}\n\n`)
    i++
  }

  console.log(`Raíz aceptada: ${x}`)
})()

function resolveFormulaByValue (formula, value) {
  const results = []
  let i = 0
  while (i < formula.length) {
    let result
    if (formula[1 + i]) {
      result = formula[0 + i] * Math.pow(value, formula[2 + i])
    } else {
      result = Math.pow(formula[0 + i], formula[2 + i])
    }
    if (formula[3 + i]) results.push([result, formula[3 + i]])
    else results.push([result])
    i = i + 4
  }
  let response
  results.forEach((result, i) => {
    if (i === 0) return
    const stackedValue = response || results[i - 1][0]
    if (results[i - 1][1] === '+') response = stackedValue + result[0]
    else response = stackedValue - result[0]
  })
  return response
}
function findX (oldX, formula, formulaDerived) {
  return oldX - (formula / formulaDerived)
}
function calculateRelativeError (x, oldX) {
  return Math.abs(((x - oldX) / Math.abs(oldX)) * 100)
}
async function getData () {
  const formula = []

  while (true) {
    const answers = await inquirer.prompt([
      {
        name: 'Inserte el coeficiente',
        validate: validateAnswer
      },
      {
        name: '¿Tendrá variable?',
        type: 'confirm',
        transformer: (input) => input ? 'x' : ''
      },
      {
        name: 'Inserte el exponente',
        validate: validateAnswer
      },
      {
        name: '¿Cómo continúa la fórmula?',
        choices: [
          'Adición',
          'Sustracción',
          'Fin de la fórmula'
        ],
        type: 'list'
      }
    ]).catch(e => console.error(e))
    const formulaPortion = Object.values(answers)
    formulaPortion[formulaPortion.length - 1] = formulaPortion[formulaPortion.length - 1] === 'Adición' ? '+' : formulaPortion[formulaPortion.length - 1] === 'Sustracción' ? '-' : ''
    formula.push(...formulaPortion)
    console.log(
      formula.map(
        (el, i) => (formula[i - 1] === 'x' || formula[i - 1] === '') && !isNaN(Number(el)) ? `^${el}` : el
      ).join('')
    )
    if (!formulaPortion[formulaPortion.length - 1]) break
  }
  return formula
}
function validateAnswer (answer) {
  return !isNaN(Number(answer)) && answer !== ''
}
