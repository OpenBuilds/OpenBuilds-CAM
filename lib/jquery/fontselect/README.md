# Fontselect jQuery Plugin

A font selector to choose from fonts available as part of the Google Web Fonts api. 

Let users easily select and preview a font from Google's large range of free fonts.

# [Demo](https://seanvm.github.io/fontselect-jquery-plugin/)

## Documentation

To create a font selector simply run the plugin on a standard html input element.

### How to use

    $('input.fonts').fontselect();

### Options

Fontselect has one argument, an options object that you might want to customise:

* style: the class to give the new font selector
* placeholder: text to use when no font is selected yet
* lookahead: a number of fonts to try and preload ahead in the select box

    $('input.fonts').fontselect({
      style: 'font-select',
      placeholder: 'Select a font',
      lookahead: 2
    });

### Events

Fontselect triggers the change event on the original element when a font is selected. 
An example is included to show how this could be used to update the font on the current page.

    $('input.fonts').fontselect().change(function(){
    
      // replace + signs with spaces for css
      var font = $(this).val().replace(/\+/g, ' ');
      
      // log font name
      console.log(font);
    });



## License / Credits

This is a continuation of the now-unmaintained [Fontselect jQuery plugin](https://github.com/tommoor/fontselect-jquery-plugin) by [Tom Moor](https://github.com/tommoor).

This plugin is released under the MIT license. It is simple and easy to understand and places almost no restrictions on what you can do with the code.
[More Information](http://en.wikipedia.org/wiki/MIT_License)


## Download

Releases are available for download from
[GitHub](https://github.com/seanvm/fontselect-jquery-plugin/releases).

Alternatively, you can download and install via NPM

`npm i fontselect-jquery-plugin` - https://www.npmjs.com/package/fontselect-jquery-plugin
