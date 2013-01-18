#jsGameLib

This is a work in progress. At the moment, it's less of a "library" and more of a "collection of files and utils that you can hack to your needs."

## Use
Install dependencies with `npm`:

```bash
npm install
```

Run with `node`:

```bash
node server
```

## Resources
You configure resources by adding to the files in `public/json`

### sounds.json
Like this:

```json
{
  "sound-name": "/sounds/sound-file-without-the-extension"
}
```

The extension is added automatically based on which sound formats the browser supports. See the [Buzz](http://buzz.jaysalvat.com/) (Buzz powers jsGameLib's sounds) docs for more.

### sprites.json
Like this:

```json
{
  "ship": {
    "img": "/img/sprites/ship.png",
    "width": 500,
    "height": 500,
    "scaleWidth": 64,
    "scaleHeight": 64,
    "animations": [
      {
        "name": "up",
        "frames": 2,
        "duration": 20
      }
    ]
  }
}
```

### Your own data
You can add your own arbitrary config/data files by creating JSON files and adding them to the array in `public/js/services/data-loader.js`.

## License
MIT
