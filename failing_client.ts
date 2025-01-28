import * as contentstack from "@contentstack/management";
import dotenv from "dotenv";
dotenv.config();

export const Client = () => {
  const key = process.env.CONTENTSTACK_API_KEY!;
  const token = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;

  console.log(key, token);

  // This Line is causing an error..  Can't tell why
  let contentstackClient = contentstack.client({
    authorization: token,
  });

  contentstackClient
    .stack({ api_key: key, management_token: token })
    .fetch()
    .then((stack) => {
      console.log(stack);
    });
};
