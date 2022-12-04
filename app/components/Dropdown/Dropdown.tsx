import { FC, ReactElement, useRef, useState } from "react";
import useClickOutside from "~/hooks/useClickOutside";
import { getBreeds } from "~/utils/data";

interface DropdownProps {
  selected: string;
  setSelected: (a: string) => void;
}

const options = Object.keys(getBreeds()).map((breed) => ({
  name: breed,
  iconSrc: "dog-wallpaper.jpeg",
}));

const Dropdown: FC<DropdownProps> = ({
  selected,
  setSelected,
}): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef(null);

  const toggle = () => setOpen(!open);

  const close = () => {
    if (open) {
      setOpen(false);
    }
  };

  const onClickOption = (option: string) => {
    setSelected(option);
  };

  useClickOutside(ref, close);

  return (
    <>
      <button
        id="dropdownUsersButton"
        data-dropdown-toggle="dropdownUsers"
        data-dropdown-placement="bottom"
        className="relative text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center"
        type="button"
        onClick={toggle}
      >
        {selected}{" "}
        <svg
          className="ml-2 w-4 h-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
        <div
          id="dropdownBreeds"
          className={`${
            !open ? "hidden" : ""
          } absolute top-0 z-10 w-60 bg-white rounded shadow dark:bg-gray-700`}
          ref={ref}
        >
          <ul
            className="overflow-y-auto py-1 h-96 text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownBreedsButton"
          >
            {options.map((option) => (
              <li key={option.name} onClick={() => onClickOption(option.name)}>
                <a
                  href="#"
                  className="flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <img
                    className="mr-2 w-12 h-12 rounded-full"
                    src={option.iconSrc}
                    alt={`${option.name}-Image`}
                  />
                  {option.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </button>
    </>
  );
};

export default Dropdown;
