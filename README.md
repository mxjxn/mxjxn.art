# mxjxn.art

Artist portfolio for Max Jackson. Next.js and the existing Vercel deployment are preserved.

## Local development

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3007
```

The production build uses `.next/`; development uses `.next-dev/` so a build does not disturb the preview. Run `npm run build` to type-check and generate the pages.

## Design direction

The September 2026 mxjxn.com redesign supplies the near-black background (`#080a08`), soft white (`#edf0e8`), pale green (`#99ed9e`), and Inter typography. The homepage is a full-screen selection of artworks with quiet captions, manual navigation, and soft crossfades. Day 48 fills the opening screen; the other selections retain their complete compositions. Each work opens an internal detail page with an uncropped full-screen viewer. The archive uses natural image proportions in justified rows, becoming a single-column gallery on phones. Mint provenance is secondary on detail pages.

Motion is restrained: short page-entry fades, image fades, and gallery crossfades. Reduced-motion preferences disable transitions and prevent the homepage video from starting automatically. The selected homepage video is muted and pausable; it pauses when the page is hidden. Keyboard users can dismiss the full-screen viewer with Escape and return focus to its opening control.

The opening selection is editorial and can change. The About copy is a draft based on the artist's existing work and stated minting history beginning in October 2020.

## Content

`src/data/artworks.json` holds 352 initial artwork pages: 281 minted records, 63 daily posts (with variants grouped on their artwork pages), and eight additional works carried over from the existing portfolio. Nine series are represented. This is not a complete career archive.

`src/data/respiration.json` adds Respiration and The Process of Exploration, bringing the portfolio to 353 works across ten series. Its title, description, duration, dimensions, and original animation URL were checked against the tokenURI on Ethereum. It remains separate from the historical import so regenerating that snapshot does not remove it.

## Collecting Respiration

The Collect page opens with the film in a large, uncropped viewing area. Below it, the title, description, and expandable provenance sit separately from a compact auction area. The initial auction view shows the live price, timing, and a text action; the bid amount field appears after wallet connection. This layout was reviewed at desktop and 390px phone widths.

`/collect` presents the artwork and the existing Cryptoart Ethereum auction, with wallet connection, an explicit bid review, wallet confirmation, transaction tracking, and a winner-only claim flow after the auction ends. Browser wallets and wallets with an in-app browser are supported through Wagmi's injected/EIP-6963 discovery. WalletConnect QR/deep-link support is not configured.

The integration is pinned to chain 1, marketplace `0x3cee515879ffe4620a1f8ac9bf09b97e858815ef`, listing 5, token contract `0xa80664f124b37b9f1ecbc6bccc5cdc9f8afb15bb`, token 1, and the artist's selling wallet. `/api/collect` reads Ethereum through PublicNode, disables caching, and verifies these identities and supported terms. RPC failures, old blocks, stale quotes, unsupported payment/fee terms, and closed auctions stop bidding. Live price and timing are never inferred from a saved listing snapshot.

The first bid starts the seven-day auction currently configured on the contract. Minimum bids use integer wei arithmetic from `SettlementLib.computeMinBid`; the Solidity auction enum is **1**, despite the older frontend helper enum starting at zero. The collector rechecks the auction and simulates the exact call before signing. Existing highest bidders are shown their status; increasing an existing bid is not exposed here. Successful transaction receipts must contain the expected bid or token-transfer event before the UI reports success. Claims use `finalize(5)` with zero ETH; the integration rejects listings with additional delivery fees.

References: [listing](https://cryptoart.social/listing/eth/5), [frontend ABI](https://github.com/mxjxn/cryptoart-studio/blob/main/apps/mvp/src/lib/contracts/marketplace.ts), [contract rules](https://github.com/mxjxn/auctionhouse-contracts/blob/main/src/libs/SettlementLib.sol), and [finalization](https://github.com/mxjxn/auctionhouse-contracts/blob/main/src/MarketplaceCore.sol).

Run `node scripts/test-sale.mjs` for bid precision, minimum increments, identity/term checks, auction timing, stale/invalid bids, calldata, and winner-only claims. `node scripts/check-sale.mjs` performs read-only mainnet verification; add `--simulate` to check a qualifying and under-minimum bid using an ephemeral test balance through `eth_call`. Both read-only simulations passed during implementation, with no signer or broadcast. The live read path, wallet chooser, and desktop/phone layouts were checked. No wallet was connected and no real bid, claim, or other transaction was signed or sent during implementation; the wallet-signing path still needs a collector-side check before public launch.

Five daily stills have local copies in `public/daily/`. Existing local assets are reused for older featured works. Other artwork still loads from its original Arweave, IPFS, or Farcaster storage. Next.js optimizes still images; GIFs retain their animation. Local video posters keep the archive from loading dozens of video players. Detail-page video is user-controlled, with HLS loaded on demand.

When the sibling research folder is available, `python3 scripts/import-artwork.py` reproduces the snapshot from `../neynar/catalog/`. It reads only the public catalog files, never the Neynar `.env` or account profile. Building and running the portfolio do not require that folder or API credentials.

`src/data/media-layout.json` caches dimensions for all 352 works and 38 generated video posters. `scripts/prepare-media.py` prepares this cache using source image metadata and FFmpeg; Pillow and network access are needed only when regenerating it. Run the catalog importer afterward to merge the prepared dimensions and poster paths. The homepage also has a local Phoenix Lens poster.

Known content limits:

- Historical catalog discovery back to October 2020 is deferred; this pass focuses on the design.
- Day 41 is unfound. Source-backed numbering corrections and duplicate daily posts remain represented by the research catalog.
- WheelGen's interactive original currently returns a 404; the page keeps its still image and explains the unavailable original.
- The GLB artwork currently displays its supplied still, pending a dedicated 3D viewer.
- Dates are shown only where supported by the source. Original mint descriptions may contain historical physical-redemption offers; review those before publication as current collecting information.
- Every remote asset has not yet been individually validated or archived.

## Validation and deployment

The production build compiles, type-checks, and generates all portfolio routes. Local HTTP checks cover the homepage, archive, representative artwork and series pages, About, a missing artwork (404), and the optimized hero image. Browser checks cover the full-screen homepage, artwork selection and motion pause, the daily archive and search, and the artwork viewer with Escape dismissal and focus restoration. Desktop and 390px phone layouts were visually reviewed.

The redesign branch is `codex/art-portfolio-redesign`. A branch push is separate from merging to the production branch (`main`); Vercel preview availability depends on the connected project's settings. The repository's existing Next.js 14.2.4 dependency reports known security issues at install time and should be upgraded and revalidated before a public deployment. This visual pass preserves the framework version and the existing social-preview image route.

## Homepage and media hosting

The full-screen opening now leads into four scrolling chapters: Render till December (six provisional selections), Muse Editions (four selections), Ethereum history beginning October 31, 2020, and calligraphy since 2017. Early LENS and Rarible artwork is not yet imported. Homepage selections and copy live in `src/app/page.tsx`.

Current local media in `public/` ships with the deployment (approximately 82 MB); remote media remains on its existing hosts. No private server or Neynar credentials are required to serve the site. Full-resolution master uploads should live in object storage rather than Git. A dedicated media hostname and pre-generated display sizes can be added later; object storage is not yet configured. Vercel image optimization and transfer usage remain subject to the project's plan.

## Curated Work page

`/art` presents a provisional five-work exhibition with varied scales and spacing. Edit the `selection` list in `src/app/art/page.tsx` to curate its order and pieces. Moving work plays silently while visible, with an explicit pause control and reduced-motion support. The daily series has its own entrance below the selection. `/archive` preserves access to every work through a searchable title index; pointer hover or keyboard focus reveals a preview on larger screens. Daily-series pages retain their existing hover-playback presentation.

## Collection exhibition and responsive review

`/archive` now presents all ten collections as near-viewport-height sections, alternating media and copy on desktop and stacking below 800px. Provisional slideshow selections live in `src/app/archive/page.tsx`. Slides advance every eight seconds only while visible, with pause/previous/next controls, keyboard-focus suspension, hidden-tab suspension, and reduced-motion handling. DegenCats and DegenGhouls remain collection-only presentations.

Reviewed the eight shared page templates (home, selected Work, Collections, daily series, artwork detail, collection-only detail, About, Collect) at desktop and phone widths: no horizontal page overflow; one main and h1 per page; images have alt attributes and buttons have names. Checked manual slideshow navigation and fullscreen Escape dismissal. Main landmarks now accept skip-link focus; long provenance text wraps. This is a practical layout/accessibility review, not a formal screen-reader or WCAG certification.
