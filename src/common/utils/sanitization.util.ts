import {Users} from "../../users/users.interface";
import {ImagePath} from "../constants/paths.constant";
import {Examples} from "../../examples/examples.interface";

class Sanitization {
  User(user: Users) {
    return {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      active: user?.active,
      hasPassword: user?.hasPassword,
      googleId: user?.googleId,
      image: user?.image && user.image.startsWith('user') ?
        `${process.env.BASE_URL}/${ImagePath.USERS}/${user.image}` :
        user?.image || undefined,
    };
  };

  Example(example: Examples) {
    return {
      id: example?._id,
      name: example?.name,
      cover: example?.cover ?
        `${process.env.BASE_URL}/${ImagePath.EXAMPLES}/${example.cover}` : example?.cover || undefined,
      images: example?.images.map((image: string) => `${process.env.BASE_URL}/${ImagePath.EXAMPLES}/${image}`)
    };
  };
}

const sanitization = new Sanitization();
export default sanitization;