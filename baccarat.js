import { create, draw, burn, remove } from './cardHandler.js'

var outcomes    = [0, 0] //0 = bank, 1 = player

const games     = Number(process.argv[2]) || 10
const threshold = Number(process.argv[3]) || 7
const started   = Date.now()
const values =
{
    "Ace": 		1,
    "Jack": 	10,
    "Queen": 	10,
    "King": 	10
}

console.log(`\n\n\x1b[90mSimulating ${games} games of Baccarat...\n\n`)
console.time("took")

for(let i = 0; i < games; i++) await main();

console.log(`\x1b[36mResult: ${outcomes[0]}-${outcomes[1]}`)
console.timeEnd("took")

async function main()
{
    const deck 		= await create()

    var player          = 0
    var player_hand     = []
    var banker          = 0
    var banker_hand     = []

    const initial_draw  = await draw()
    const toburn        = values[initial_draw.card] || initial_draw.card

    for(let i = 0; i < toburn; i++)
    {
        burn()
    }

    for(let i = 0; i < 2; i++)
    {
        const c1 = await draw()
        const c2 = await draw()

        player  += values[c1.card] || c1.card
        banker  += values[c2.card] || c2.card

        player_hand.push(c1.suited)
        banker_hand.push(c2.suited)

        player  = player % 10
        banker  = banker % 10
    }

    while(player < threshold && banker < threshold)
    {
        const c1 = await draw()
        const c2 = await draw()

        player  += values[c1.card] || c1.card
        banker  += values[c2.card] || c2.card

        player_hand.push(c1.suited)
        banker_hand.push(c2.suited)

        player  = player % 10
        banker  = banker % 10
    }

    if(banker > player) outcomes[0]++
    else                outcomes[1]++

    await remove()

    return
}






