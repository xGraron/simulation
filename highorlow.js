import { create, draw, remove } from './cardHandler.js'
import { Random }               from "random-js"

const random    = new Random()
var outcomes    = [0, 0] //0 = lost, 1 = won
var winnings    = 0
var spent       = 0
var color       = ""
var c2          = ""

const games     = Number(process.argv[2]) || 10
const started   = Date.now()
const values    =
{
    "Ace": 	2,
    "Jack": 10,
    "Queen": 10,
    "King": 10
}

console.log(`\n\n\x1b[90mSimulating ${games} games of High or Low...\n\n`)
console.time("took")

for(let i = 0; i < games; i++) await main();

if(outcomes[0] < (outcomes[1])) color   = "\x1b[31m"
else                            color   = "\x1b[32m"
if(spent > winnings)            c2      = "\x1b[31m"
else                            c2      = "\x1b[32m"

console.log(`\x1b[36mResult: player lost ${color}${outcomes[0]}/${games}`)
console.group(`\x1b[0m`)
console.log(`Player spent ${spent} & won ${winnings}`)
console.log(`Total revenue: ${c2}${winnings - spent}\n\x1b[90m`)
console.groupEnd("Details")
console.timeEnd("took")

async function main(bet = 50)
{
    const deck = await create()

    const player        = random.integer(0, 10)
    const drawn 	    = await draw()
    const card		    = drawn.card
    const points        = values[card] || card
    const dealer_drawn  = await draw()
    const dealer_card	= dealer_drawn.card
    const dealer_points	= values[dealer_card] || dealer_card
    const remaining		= dealer_drawn.remaining

    var reward	= Math.floor(bet / 2) + bet
    var chosen 	= 0
    var final 	= 0

    if		(player < 5)    chosen = 1
    else if	(player > 5)    chosen = 2
    else			        chosen = 3

    if		(dealer_points < points) 		final = 1
    else if	(dealer_points === points)		final = 2
    else									final = 3

    if(chosen === 2) reward = (bet * 2) + Math.floor(bet / 2);

    if(final === chosen)
    {
        outcomes[1]++   //won
        winnings += bet
    }
    else
    {
        outcomes[0]++   //lost
    }

    spent += bet
    remove()
}

