import { Random } from "random-js"

const random            = new Random()

var outcomes            = [0, 0] //0 = lost, 1 = won
var color               = ""

const games     = Number(process.argv[2]) || 10
const emojis    = Number(process.argv[3]) || 5
const started   = Date.now()

console.log(`\n\n\x1b[90mSimulating ${games} games of Slots...\n\n`)
console.time("took")

for(let i = 0; i < games; i++) await main();

if(outcomes[0] < (outcomes[1])) color = "\x1b[31m"
else                            color = "\x1b[32m"

console.log(`\x1b[36mResult: player lost ${color}${outcomes[0]}/${games}`)
console.group(`\x1b[0m`)
console.log(`testicles`)
console.timeEnd("took")
console.groupEnd("Details")

async function main()
{
    const payline = []

    //spinning
    for(let i = 0; i < 3; i++)
    {
        payline.push(random.integer(0, emojis - 1))
    }

    const [a, b, c] = payline

    if(a === b && a === c)                  outcomes[1]++;
    else if( a === b || b === c || a === c) outcomes[1]++;
    else  								    outcomes[0]++;
}
