'use strict'

var PSD = require('psd')

var slugify = require('slugify')
var _ = require('lodash')
var program = require('commander')
 
program
  .version('0.0.1')
  .option('-f, --file <path>', 'psd input file')
  .parse(process.argv)
console.log(program.file)
if(program.file.toString().indexOf('psd') < 0){
  console.error('Not a PSD file')
  return -1
} else {
  var psd = PSD.fromFile(program.file)
}
psd.parse()
var psdExport = psd.tree().export()
//console.log(psdExport)

const searchForImage = (el) => {
  if (el && el.hasChildren()) {
    searchForImage(el.childeren)
  } else if (el) {
    try{
      el.layer.image.saveAsPng(`./${slugify(el.layer.name)}.png`)
    } catch (err){
      console.error(`An error occured.`)
      console.error(err)
    }
  }
}

psd.tree().descendants().forEach((el) => {
  searchForImage(el)
})

var replace = _.filter(psdExport.children, function (layer) {
  // console.log('layer: ', layer.name)
  return layer.name.indexOf('Header') > -1
})
let text = {}

var IterateAndSearch = function (el, groupName) {
  _.each(el, function (el) {
    if (el.type === 'group') {
      text[el.name] = []
      IterateAndSearch(el.children, el.name)
    } else if (el.type === 'layer' && el.text) {
      // console.log('Text:', el.text.value)
      let translation = {}
      translation[_.camelCase(el.name)] = el.text.value
      text[groupName].push(translation)
    } else {
      // console.log(el)
    }
  })
}
var cleanObject = function (translation) {
  let cleanTranslation = {}
  _.each(translation, function (value, key) {
    if (value.length > 0) {
      cleanTranslation[key] = value
    }
  })
  return cleanTranslation
}

// console.log(replace)
IterateAndSearch(replace)
let cleanStrings = cleanObject(text)

console.log(cleanStrings)
