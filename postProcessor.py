from time import strftime

with open('index.html') as f:
    content = f.read()

startStr = '// dynamic start\n        let debugContent="'
startIndex = content.index(startStr) + len(startStr)
endIndex = content.index('";//dynamic generated time',startIndex)
print(content[startIndex:endIndex])

timestamp = str(strftime("%Y-%m-%d %H:%M:%S"))
newContent = content[:startIndex] + timestamp + content[endIndex:]

# content = content.replace("REPLACED_BY_EXTERNAL_SCRIPT",str(strftime("%Y-%m-%d %H:%M:%S")))

with open('index.html','w') as f:
    f.write(newContent)