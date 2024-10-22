const puppeteer = require("puppeteer");

const writeReview = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  console.log("Navigating to gpt.");

  const gpt = await browser.newPage();
  await gpt.goto("https://deepai.org/chat/free-chatgpt", {
    waitUntil: "networkidle2",
  });
  console.log("Getting Data from gpt.");

  await gpt.waitForSelector("textarea.chatbox");
  await gpt.type(
    "textarea.chatbox",
    `Write a general-purpose review for the website "cloudnest.in," which provides domain registration, shared hosting, reseller hosting, VPS, and SSL services. The review should be 4 lines long and cover their services in general. Select a random Indian name as the reviewer's name, and mention a random service (like shared hosting or VPS) in the review. give me in the json format like {name:'', review:''}`
  );
  await gpt.keyboard.press("Enter");

  await gpt.waitForSelector("code.language-json");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Extract the JSON string from the gpt
  const jsonData = await gpt.evaluate(() => {
    // Target the code block containing JSON (use the appropriate selector)
    const jsonElement = document.querySelector("code.language-json");
    const jsonText = jsonElement.textContent;

    // Parse and return the JSON object
    return JSON.parse(jsonText);
  });

  console.log("Data Extracted from gpt. ");
  console.log(jsonData);
  console.log("Getting Email.");

  const page = await browser.newPage();

  await page.goto("https://tempmailso.com/", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector("a.btn.btn-1");
  const button = await page.$("a.btn.btn-1");

  const href = await page.evaluate((el) => el.getAttribute("href"), button);

  if (href === "https://tempmailso.com/change") {
    await page.click("a.btn.btn-1"); // Click the button
  } else {
    console.error(
      `Unexpected href: ${href}. Expected: https://tempmailso.com/change`
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const emailValue = await page.evaluate(() => {
    const emailInput = document.querySelector("input#trsh_mail");
    return emailInput ? emailInput.value : null; // Ensure the input exists
  });

  if (!emailValue) {
    console.error("Failed to retrieve email value.");
    await browser.close();
    return;
  }

  console.log("Got Email." + emailValue);
  console.log("On The Trustpilot page.");

  const trustpilotPage = await browser.newPage();
  await trustpilotPage.goto(
    "https://www.trustpilot.com/evaluate/cloudnest.in",
    {
      waitUntil: "networkidle2",
    }
  );

  await trustpilotPage.waitForSelector('input[type="radio"][value="5"]');
  await trustpilotPage.click('input[type="radio"][value="5"]');

  await trustpilotPage.waitForSelector("textarea#review-text");
  await trustpilotPage.type("textarea#review-text", jsonData.review);

  await trustpilotPage.waitForSelector("input#review-date-of-experience");

  await trustpilotPage.focus("input#review-date-of-experience");
  await trustpilotPage.keyboard.press("Enter");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await trustpilotPage.waitForSelector(
    'button[data-reveal-email-flow-button="true"]'
  );
  await trustpilotPage.click('button[data-reveal-email-flow-button="true"]');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await trustpilotPage.waitForSelector("input#email-lookup");
  await trustpilotPage.type("input#email-lookup", emailValue);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await trustpilotPage.waitForSelector(
    'button[data-email-lookup-button="true"]'
  );
  await trustpilotPage.click('button[data-email-lookup-button="true"]');

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await trustpilotPage.waitForSelector("input#signup-name-input");
  await trustpilotPage.type("input#signup-name-input", jsonData.name);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await trustpilotPage.waitForSelector('button[data-signup-button="true"]');
  await trustpilotPage.click('button[data-signup-button="true"]');

  console.log("Added details on Trustpilot page.");
  console.log("Getiing code from mail.");

  const pages = await browser.pages();
  const tempEmailPage = pages.find((p) => p.url().includes("tempmailso.com"));
  await tempEmailPage.bringToFront();
  await tempEmailPage.reload();

  await tempEmailPage.waitForSelector("div.col-md-6.ov-h.d_hide");

  const code = await tempEmailPage.evaluate(() => {
    const emailDiv = document.querySelector(
      "div.col-md-6.ov-h.d_hide a.subject_email"
    );
    return emailDiv ? emailDiv.textContent.match(/code (\d+)/)[1] : null;
  });

  if (!code) {
    console.error("Failed to retrieve verification code.");
    await browser.close();
    return;
  }
  console.log("got code from mail." + code);
  console.log("enntering code to trustpilot.");

  const trustpilotpage2 = pages.find((p) => p.url().includes("trustpilot.com"));
  await trustpilotpage2.bringToFront();
  await trustpilotpage2.waitForSelector("input#verification-code-input");
  await trustpilotpage2.type("input#verification-code-input", code);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await trustpilotPage.waitForSelector('button[name="submit-review"]');
  await trustpilotPage.click('button[name="submit-review"]');

  // Optionally close the browser
  console.log("Review Completed");

  await browser.close();
};

module.exports = writeReview;
