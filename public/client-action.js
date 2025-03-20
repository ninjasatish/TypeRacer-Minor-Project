const socket = io();

        const originalText = document.getElementById("originalText");
        const typingArea = document.getElementById("typingArea");
        const highlightedText = document.getElementById("highlightedText");
        let wordsOriginal = ""
        let imagesMode = 0
        let index = 0
        let letters 


        // you received a new paragraph from admin
        socket.on('receiveParagraph', (data) => {
            if(data[0] == '~'){
                imagesMode = 1
                data = data.substring(1)

                console.log(data)
                letters = data 
                letters.split("")

                document.getElementById("highlightedText").innerHTML = ` 
                    <img src = "./images/${data[index]}.png" object-fit="cover" />
                `;
            }
            else {
                document.getElementById("highlightedText").textContent = data ;
            }
            console.log("client received : ", data)
            console.log("mode = ", imagesMode)
            wordsOriginal = data.split("")
        });

        wordsOriginal.split("")

        let flag = 0 
        let timeTaken = 0

        // client is typing 
        typingArea.addEventListener("input", () => {
            if(flag == 0){
                flag = 1
                timeTaken = new Date()
                console.log(timeTaken)
            }

            const userText = typingArea.value;
            const wordsUser = userText.split("");

            let highlightedHTML

            // if We have a text paragraph then highlight it
            if(imagesMode == 0){
                highlightedHTML = wordsOriginal.map((word, index) => {
                    if (wordsUser[index] === word) {
                        return `<span class="correct">${word}</span>`;
                    } else if (wordsUser[index]) {
                        return `<span class="incorrect">${word}</span>`;
                    } else {
                        return `<span>${word}</span>`;
                    }
                }).join("");

                if(JSON.stringify(wordsUser) === JSON.stringify(wordsOriginal)){
                    const name = localStorage.getItem('name')
                    timeTaken = new Date().getTime() - timeTaken.getTime() + 1 ;
                    console.log("Race completed")
                    const speed = wordsOriginal.length * 1000 * 60 / 5 /  timeTaken
                    console.log(speed)
                    originalText.textContent = `${name} Completed the Race ! Your speed was ${Math.floor(speed)} WPM !`
                    typingArea.value = ""
                    highlightedText.value = ""
    
                    console.log(timeTaken)
    
                    socket.emit("complete", {name, speed});
                }
    
                highlightedText.innerHTML = highlightedHTML;
                
                console.log(wordsUser)
                console.log(wordsOriginal)
            }

            // if we have image mode then move to next image
            else{ 
                if(wordsUser[wordsUser.length - 1] == letters[index]){ // letter typed correctly move to next letter
                    index ++ ;
                    console.log("letter typed correctly")

                    if(index == letters.length){
                        const name = localStorage.getItem('name')
                        timeTaken = new Date().getTime() - timeTaken.getTime() + 1 ;
                        console.log("Race completed")
                        const speed = letters.length * 1000 * 60 / 5 /  timeTaken
                        console.log(speed)

                        originalText.textContent = `${name} Completed the Race ! Your speed was ${Math.floor(speed)} WPM !`
                        typingArea.value = ""
                        highlightedText.value = ""
        
                        console.log(timeTaken)
        
                        socket.emit("complete", {name, speed});
                    }
                    else {
                        document.getElementById("highlightedText").innerHTML = ` 
                            <img src = "./images/${letters[index]}.png" />
                        `;
                    }
                }
                else{ // letter is not typed correctly , don't change the image
                    console.log("letter typed Incorrectly")
                }

            }


            
        });

        // leaderboard computation
        socket.on('scores', (ranklist) =>{

            console.log("working")
            
            ranklist.forEach(element => {
                const rankTable = document.getElementById("rank");
                rankTable.innerHTML = ""; // Clear previous leaderboard


                ranklist.forEach((element, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${element.name}</td>
                        <td>${Math.floor(element.speed)} WPM</td>
                    `;
                    rankTable.appendChild(row);
                });
            });
        });