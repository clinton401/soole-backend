import { UserModel, User } from "./nobox/record-structures/user";
import bcrypt from "bcrypt";

const createHardcodedUser = async () => {
  try {
    const plainPassword = "1234567";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const hardcodedUser: User = {
      phone: "+2347032778210",
      firstName: "John",
      lastName: "Doe",
      isNumberVerified: true,
      gender: "MALE",
      dob: "1990-01-01",
      username: "johndoe",
      email: "johndoe@example.com",
      password: hashedPassword,
    };

    const existingUser = await UserModel.findOne({
      phone: hardcodedUser.phone,
      email: hardcodedUser.email,
    });

    if (existingUser) {
      console.log("User already exists.");
      return;
    }

    const user = await UserModel.insertOne(hardcodedUser);

    if (user) {
      console.log("Hardcoded user added successfully!");
    } else {
      console.log("Failed to add hardcoded user.");
    }
  } catch (error) {
    console.error("Error adding hardcoded user:", error);
  }
};

export default createHardcodedUser;
