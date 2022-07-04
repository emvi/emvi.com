# How to Create a Custom Icon Font

17. April 2020

At some point in creating a web application, you might find yourself in need of some sort of iconography. Icons help to convey certain actions faster, because they are easier to process, need no translation and resemble established patterns users are already familiar with.

![Balázs Kétyi/Unsplash](/assets/blog/icon-font/title.jpg)

*Balázs Kétyi/Unsplash*

While there are many free options like Google's Material Icons or FontAwesome, building a custom set on your own has its advantages. You can match them perfectly to the design language, making the experience more visually pleasing.

When it comes to managing the growing number of icons inside the project, different approaches are viable:

* Single files: Keeping icons as .svg or .png files in a folder lets you add and remove them quickly. This is quite useful in the early stages of development.
* Inline SVG: Pasting a single line of code to your HTML is even faster, but keeping track is difficult.
* Icon fonts: Combining all icons to a font brings additional benefits, like being able to freely change their color using CSS.

In this article I will walk you through the process of drawing, exporting and bundling your icons to a font in the same way we do it at Emvi. After importing it to any project, you will be able to use them by adding a single line of HTML.

## Drawing your icons

We will create our icons using Figma. Figma is great because it's free to use, its vector capabilities are powerful enough to create any kind of icon and it exports clean SVG files we can continue with.

There are many great tutorials on how to get started with Figma and what to look out for when creating icons, so I won't get into much detail. When you draw your icons, make sure to stick to the same dimensions — common sizes are 16x16, 20x20, 24x24 or 32x32. They cannot contain any pixel-based graphics, like PNGs or JPEGs, and have to be in a single color.

![Balázs Kétyi/Unsplash](/assets/blog/icon-font/step1.png)

*Select all icons you would like to export as separate files.*

Once you are happy with what you created, export them to SVG in the bottom right corner.

## Creating an icon font

To bundle our icons to a font, we use Nucleo's desktop app. In case you don't want to start your collection from scratch, Nucleo offers over 28.000 high-quality icons for a one-time payment with lifetime updates. Using their organizer for external icons is free.

Note: While they are currently not offering a Linux client, I had no trouble installing and using the Windows version with Wine.

After installing and starting the desktop app, click on the "+" in the top left corner, to create a new set. You can drag and drop a folder with your icons into the application and give it a name.

![Balázs Kétyi/Unsplash](/assets/blog/icon-font/step2.png)

*Leave the Style on "Auto"*

Make sure that the grid size at the bottom left only shows a single option. It should reflect the dimensions you chose in Figma. 

![Balázs Kétyi/Unsplash](/assets/blog/icon-font/step3.png)

*The frames in Figma were 24x24px*

To create the icon font, right-click on the set name and select "Export". Click on "Icon Font" and you will be asked to choose a name for the font.

![Balázs Kétyi/Unsplash](/assets/blog/icon-font/step4.png)

*You can also change the metadata if you so desire*

Click "Export Icons" and select an empty folder. Once finished, you will find numerous files in there, including a demo.html to see all icons and their names.

![Balázs Kétyi/Unsplash](/assets/blog/icon-font/step5.png)

Import and usage

To get started with development, copy the files in /fonts and /css to your project and import the style sheet in the HTML <head>. The font-size is set to 32px by default, so I changed it to my 24px.

```html
<link rel="stylesheet" type="text/css" href="/font/myset.css" />
```

You can now add an icon to any element by simply adding two classes:

```html
<i class="icon icon-plus"></i>
```

That's it! Check out more of our articles and follow us for future updates.
