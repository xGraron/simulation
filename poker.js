import { create, draw, burn, remove } from './cardHandler.js'

const values =
{
    "ace": 		14,
    "2": 		2,
    "3": 		3,
    "4": 		4,
    "5": 		5,
    "6": 		6,
    "7": 		7,
    "8": 		8,
    "9": 		9,
    "10": 		10,
    "jack": 	11,
    "queen": 	12,
    "king": 	13
}

const multipliers =
{
    "Royal Flush": 		100,
    "Straight Flush": 	20,
    "Four Of A Kind": 	10,
    "Full House": 		3,
    "Flush":  			2,
    "Straight":  		1,
    "Three Of A Kind":  1,
    "Two Pair": 		1,
    "Pair":             1,
    "High Card": 		1,
}

var outcomes            = [0, 0, 0, 0]
var games               = 100000
var color               = ""

console.log("\n\n\x1b[90mRunning...\n\n")

for(let i = 0; i < games; i++) await main();

if(outcomes[0] < (outcomes[1] + outcomes[3]))   color = "\x1b[31m"
else                                            color = "\x1b[32m"

console.log(`\x1b[36mResult: player lost ${color}${outcomes[0]}/${games} \n\n\x1b[36mDetails: \nLost: ${outcomes[0]} \nWon: ${outcomes[1] + outcomes[3]} \nWon by dnq: ${outcomes[3]} \nTied: ${outcomes[2]}`)

async function main()
{
    const deck 		= await create()

    var	hand				= []
    var dealer_hand			= []
    var community_hand		= []

    for(let i = 0; i < 2; i++)
    {
        await player_draw(hand)
        await dealer_draw(dealer_hand)
    }

    await burn()

    for(let i = 0; i < 3; i++)
    {
        await community_draw(community_hand)
    }

    await burn()

    for(let i = 0; i < 2; i++)
    {
        await community_draw(community_hand)
    }

    const final = await wincon([...hand, ...community_hand], [...dealer_hand, ...community_hand])

    outcomes[final.won]++

    await remove()

    return
}

async function player_draw(hand)
{
    const drawn = await draw()

    hand.push(drawn.suited)

    return
}

async function dealer_draw(dealer_hand)
{
    const drawn = await draw()

    dealer_hand.push(drawn.suited)

    return
}

async function community_draw(community_hand)
{
    const drawn = await draw()

    community_hand.push(drawn.suited)

    return
}

async function calculate(cards)
{
    const sorted = cards.map(card =>
    {
        const suit 	= card.slice(-1)
        const rank 	= card.slice(0, -1).toLowerCase()
        const value = values[rank]

        return { suit, rank, value }
    })

    const counts 	= {}
    const suits 	= { h: [], s: [], d: [], c: [] }

    for(const card of sorted)
    {
        counts[card.value] = (counts[card.value] || 0) + 1
        suits[card.suit].push(card.value)
    }

    const valuesSorted = sorted.map(c => c.value).sort((a, b) => b - a)
    const countsSorted = Object.entries(counts).sort((a, b) => b[1] - a[1] || b[0] - a[0])

    //flush
    let fSuit = null

    for(const suit in suits)
    {
        if(suits[suit].length >= 5)
        {
            fSuit = suit
        }
    }

    //stragit + straight flush
    const straight = (valuesSorted) =>
    {
        const unique = [...new Set(valuesSorted)].sort((a, b) => a - b)

        for(let i = 0; i <= unique.length - 5; i++)
        {
            const sequence = unique.slice(i, i + 5)

            if(sequence[4] - sequence[0] === 4) return sequence[4]
        }

        if(unique.includes(14) && unique.includes(2) && unique.includes(3) && unique.includes(4) && unique.includes(5)) return 5;

        return null;
    }

    let hand = "High Card", rank = 1, kickers = valuesSorted.slice(0, 5)

    const sFlush = fSuit ? straight(suits[fSuit]) : null

    if(sFlush)
    {
        if(sFlush === 14) 	return 	{ hand: "Royal Flush", rank: 10, kickers: [sFlush]}
        else 				return 	{ hand: "Straight Flush", rank: 9, kickers: [sFlush]}
    }

    if(countsSorted[0][1] === 4)
    {
        hand 	= "Four Of A Kind"
        rank 	= 8
        const fourKindValue = Number(countsSorted[0][0])
        const kicker = valuesSorted.filter(v => v !== fourKindValue)[0]
        kickers = [fourKindValue, kicker]
    }
    else if(countsSorted[0][1] == 3 && countsSorted[1]?.[1] >= 2)
    {
        hand 	= "Full House"
        rank 	= 7
        kickers = [Number(countsSorted[0][0]), Number(countsSorted[1][0])]
    }
    else if(fSuit)
    {
        hand 	= "Flush"
        rank 	= 6
        kickers = suits[fSuit].sort((a, b) => b - a).slice(0, 5)
    }
    else
    {
        const straightHigh = straight(valuesSorted)

        if(straightHigh)
        {
            hand 	= "Straight"
            rank 	= 5
            kickers = [straightHigh]
        }
        else if(countsSorted[0][1] === 3)
        {
            hand 	= "Three Of A Kind"
            rank 	= 4
            kickers = [Number(countsSorted[0][0]), ...valuesSorted.filter(value => value !== Number(countsSorted[0][0])).slice(0, 2)];
        }
        else if(countsSorted[0][1] === 2 && countsSorted[1]?.[1] === 2)
        {
            hand 	= "Two Pair"
            rank 	= 3

            const pair1 = Number(countsSorted[0][0])
            const pair2 = Number(countsSorted[1][0])
            kickers 	= [pair1, pair2, ...valuesSorted.filter(value => value !== pair1 && value !== pair2).slice(0, 1)];
        }
        else if(countsSorted[0][1] === 2)
        {
            hand 	= "Pair"
            rank 	= 2

            const pairVal		= Number(countsSorted[0][0])
            const uniqueKickers = [...new Set(valuesSorted.filter(value => value !== pairVal))]

            kickers = [pairVal, ...uniqueKickers.slice(0, 3)]
        }
    }

    return { hand, rank, kickers }
}

async function wincon(player_cards, dealer_cards)
{
    const playerFinal = await calculate(player_cards)
    const dealerFinal = await calculate(dealer_cards)

    const qualified = qualifier(dealerFinal)

    if(!qualified)
    {
        return { won: 3 };
    }

    if(playerFinal.rank > dealerFinal.rank) return { won: 1 }
    if(playerFinal.rank	< dealerFinal.rank) return { won: 0 }

    for(let i = 0; i < Math.min(playerFinal.kickers.length, dealerFinal.kickers.length); i++)
    {
        if(playerFinal.kickers[i] > dealerFinal.kickers[i])
        {
            return {won: 1 }
        }

        if(playerFinal.kickers[i] < dealerFinal.kickers[i])
        {
            return { won: 0 }
        }
    }

    return { won: 2 }
}

function qualifier(dealerFinal)
{
    if (dealerFinal.rank > 2) return true;

    if (dealerFinal.hand === "Pair")
    {
        const pairVal = dealerFinal.kickers[0]
        if(pairVal >= 4)	return true;
        else  				return false;
    }
}
