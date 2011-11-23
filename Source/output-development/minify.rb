#!/usr/bin/env ruby
require 'juicer'

puts "Merge css/base.css:"
puts `juicer merge css/base.css -o css/base.minified.css --embed-images data_uri --force`

puts "Merge js/main.js:"
puts `juicer merge js/main.js -o js/main.minified.js --force -s`

output_path = "../xhtml2html5_assets.xml"
puts "Combining minified files into xhtml2html5_assets.xml (there has to be one)."
`echo "<minified><css>" > #{output_path}`
`cat css/base.minified.css >> #{output_path}`
`echo "</css><javascript>" >> #{output_path}`
`cat js/main.minified.js >> #{output_path}`
`echo "</javascript></minified>" >> #{output_path}`

puts "Done. (probably)"