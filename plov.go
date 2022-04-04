package main

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

func catch(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func getPng(path string) image.Image {
	f, err := os.Open(path)
	catch(err)
	defer f.Close()
	img, _, err := image.Decode(f)
	catch(err)
	return img
}

func getPngs(paths []string) []image.Image {
	var imgs []image.Image
	for _, p := range paths {
		imgs = append(imgs, getPng(p))
	}
	return imgs
}

func explode(img image.Image) image.Image {
	b := img.Bounds()

	newImg := image.NewRGBA(
		image.Rect(3*b.Min.X, 3*b.Min.Y, 3*b.Max.X, 3*b.Max.Y),
	)

	for y := b.Min.Y; y < b.Max.Y; y++ {
		for x := b.Min.X; x < b.Max.X; x++ {
			newImg.Set(3*x+1, 3*y+1, img.At(x, y))
		}
	}

	return newImg
}

func implode(img image.Image) image.Image {
	b := img.Bounds()

	if b.Dx()%3 != 0 || b.Dy()%3 != 0 {
		log.Fatal("Image dimensions aren't divisible by 3")
	}

	newImg := image.NewRGBA(
		image.Rect(b.Min.X/3, b.Min.Y/3, b.Max.X/3, b.Max.Y/3),
	)

	nb := newImg.Bounds()

	for y := nb.Min.Y; y < nb.Max.Y; y++ {
		for x := nb.Min.X; x < nb.Max.X; x++ {
			newImg.Set(x, y, img.At(3*x+1, 3*y+1))
		}
	}

	return newImg
}

func savePng(img image.Image, path string) {
	f, err := os.Create(path)
	catch(err)
	png.Encode(f, img)
	f.Close()
}

func flatten(imgs []image.Image) image.Image {
	b := imgs[0].Bounds()
	flt := image.NewRGBA(b)

	for i := 0; i < len(imgs); i++ {
		img := imgs[i]

		draw.Draw(flt, b, img, image.Point{}, draw.Over)
	}

	return flt
}

var re = regexp.MustCompile(`^x `)

func layers(path string) []string {
	f, err := ioutil.ReadFile(path)
	catch(err)
	lns := strings.Split(strings.Replace(string(f), "\r\n", "\n", -1), "\n")
	var lrs []string
	for _, l := range lns {
		if l == "" || re.FindString(l) != "" {
			continue
		}
		lrs = append(lrs, l)
	}
	return lrs
}

func isTransparent(c color.Color) bool {
	_, _, _, a := c.RGBA()
	return a == 0
}

func crop(img image.Image) image.Image {
	b := img.Bounds()
	minX := b.Max.X
	maxX := b.Min.X
	minY := b.Max.Y
	maxY := b.Min.Y

minY:
	for y := b.Min.Y; y < b.Max.Y; y++ {
		for x := b.Min.X; x < b.Max.X; x++ {
			if !isTransparent(img.At(x, y)) {
				minY = y
				break minY
			}
		}
	}

minX:
	for x := b.Min.X; x < b.Max.X; x++ {
		for y := minY; y < b.Max.Y; y++ {
			if !isTransparent(img.At(x, y)) {
				minX = x
				break minX
			}
		}
	}

maxX:
	for x := b.Max.X; x > minX; x-- {
		for y := minY; y < b.Max.Y; y++ {
			if !isTransparent(img.At(x, y)) {
				maxX = x
				break maxX
			}
		}
	}

maxY:
	for y := b.Max.Y; y > minY; y-- {
		for x := minX; x < maxX; x++ {
			if !isTransparent(img.At(x, y)) {
				maxY = y
				break maxY
			}
		}
	}

	cropped := image.NewRGBA(image.Rect(minX, minY, maxX, maxY))
	draw.Draw(cropped, cropped.Bounds(), img, image.Point{minX, minY}, draw.Src)

	return cropped
}

func cropLayers() {
	files := layers("layers.txt")

	catch(os.MkdirAll("cropped", 0755))

	for _, f := range files {
		savePng(crop(getPng(f)), "cropped/"+"cropped-"+filepath.Base(f))
	}
}

func main() {
	if len(os.Args) < 2 {
		savePng(explode(flatten(getPngs(layers("layers.txt")))), "overlay.png")
		return
	}

	switch os.Args[1] {
	case "flatten":
		savePng(flatten(getPngs(layers("layers.txt"))), "flat.png")
	case "explode":
		savePng(explode(getPng(os.Args[2])), "exploded.png")
	case "implode":
		savePng(implode(getPng(os.Args[2])), "imploded.png")
	case "crop":
		if len(os.Args) < 3 {
			cropLayers()
		} else {
			savePng(crop(getPng(os.Args[2])), "cropped.png")
		}
	default:
		fmt.Println("Unknown command ", os.Args[1])
		os.Exit(1)
	}
}
