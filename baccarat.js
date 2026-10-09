import { create, draw, burn, remove } from './cardHandler.js'

main()

const values =
{
    "Ace": 		1,
    "Jack": 	10,
    "Queen": 	10,
    "King": 	10
}

async function main()
{
    const deck 		= await create()

    var player          = 0
    var player_hand     = []
    var bank            = 0
    var bank_hand       = []

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
        bank    += values[c2.card] || c2.card

        player_hand.push(c1.suited)
        bank_hand.push(c2.suited)

        player  = player % 10
        bank    = bank % 10
    }

    while(player < 7 && bank < 7)
    {
        const c1 = await draw()
        const c2 = await draw()

        player  += values[c1.card] || c1.card
        bank    += values[c2.card] || c2.card

        player_hand.push(c1.suited)
        bank_hand.push(c2.suited)

        player  = player % 10
        bank    = bank % 10
    }

    console.log(player + " - " + player_hand)
    console.log(bank + " - " + bank_hand)

    await remove()

    return
}






