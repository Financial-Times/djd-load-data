# loadData
## A general-purpose multi-data loader by [Ændrew][1] in 2017

### Installation:

```bash
$ npm install @financial-times/load-data --save
```

### Usage:

#### TypeScript/ES6:

```javascript
import loadData from '@financial-times/load-data';

// Single file
loadData('data1.csv').then(data1 => {
  // do something with data1
});

// Yes, you can use it with async/await...
(async () => {
  const [data2, data3] = await loadData([ // ... and with multiple files
    'data2.tsv',
    'data3.json',
  ]);

  // do something with data2 and data3
}());
```

#### Browser:

```html
<script src="https://unpkg.com/@financial-times/load-data"></script>
<script>
  loadData('data1.tsv').then((data1) => {
    // Do something with data1 here
  });
</script>
```

### Supported file types:
*N.b., load-data detects file type using extension. Ensure it has the following or it will fail!*

* TSV
* Annotated TSV
* CSV
* JSON

[1]: https://www.github.com/aendrew
