import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

let json_data = ""
resolver.define('getdescription', async (req) => {
  const issueKey = req.context.extension.issue.key;

  try {
    const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`);
    const data = await res.json();
    json_data = data.fields.description;
    let resulting_text = "";
    const processContent = (content) => {
      if (content.type === 'paragraph') {
        if (content.content) {
          content.content.forEach((innerContent) => {
            if (innerContent.type === 'text') {
              if (innerContent.marks && innerContent.marks.length > 0) {
                const formattedText = processMarks(innerContent.marks, innerContent.text);
                resulting_text += formattedText;
              } else {
                resulting_text += innerContent.text;
              }
            }
          });
          resulting_text = resulting_text;
        }
      } else if (content.type === "bulletList") {
        resulting_text += "<ul>";
        content.content.forEach((listItem) => {
          if (
            listItem.type === "listItem" &&
            listItem.content &&
            listItem.content.length > 0 &&
            listItem.content[0].type === "paragraph"
          ) {
            resulting_text += `<li>${listItem.content[0].content[0].text}</li>`;
          }
        });
        resulting_text += "</ul>";
      } else if (content.content) {
        content.content.forEach((innerContent) => {
          processContent(innerContent);
        });
      }
    };
    
    json_data.content.forEach((item) => {
      processContent(item);
    });
    
    json_data = resulting_text
    return resulting_text;
  }
  catch (error) {
    console.error("Error getdescription:", error);
    return null;
  }
});


resolver.define('enhancedescription', async (req) => {
  const { description } = req.payload;
  //console.log("req:",req.payload);
  try {
    if (description){
      const response = await api.fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: 'POST',
          headers: {
            "Authorization": `Bearer '${process.env.FORGE_USER_VAR_OPENAI_API_KEY}'`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{"role": "user", "content":  `Create the test scenarios for the given description : '${description}'`}],
            temperature : 0.7,
            max_tokens : 4000
          }),
        }
      );
  
      const result = await response.json();
      //console.log("result:::::::::::::::",result.choices[0].message.content)
      return result.choices[0].message.content;
    }
    }
     catch (error) {
    console.error("Error Enhancing Description:", result);
    return result;
  }
  
});

export const handler = resolver.getDefinitions();
