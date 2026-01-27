// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";

// interface AppPaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
// }

// export function AppPagination({
//   currentPage,
//   totalPages,
//   onPageChange,
// }: AppPaginationProps) {
//   if (totalPages <= 1) return null;

//   return (
//     <div className="flex justify-center py-6">
//       <Pagination>
//         <PaginationContent>
//           <PaginationItem>
//             <PaginationPrevious
//               className="cursor-pointer"
//               onClick={() =>
//                 onPageChange(Math.max(1, currentPage - 1))
//               }
//             />
//           </PaginationItem>

//           {Array.from({ length: totalPages }, (_, i) => (
//             <PaginationItem key={i}>
//               <PaginationLink
//                 className="cursor-pointer"
//                 isActive={currentPage === i + 1}
//                 onClick={() => onPageChange(i + 1)}
//               >
//                 {i + 1}
//               </PaginationLink>
//             </PaginationItem>
//           ))}

//           <PaginationItem>
//             <PaginationNext
//               className="cursor-pointer"
//               onClick={() =>
//                 onPageChange(Math.min(totalPages, currentPage + 1))
//               }
//             />
//           </PaginationItem>
//         </PaginationContent>
//       </Pagination>
//     </div>
//   );
// }

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AppPagination({ currentPage, totalPages, onPageChange }: AppPaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center py-6">
      <Pagination>
        <PaginationContent>
          {/* PREVIOUS */}
          <PaginationItem>
            <PaginationPrevious
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              onClick={() => onPageChange(currentPage - 1)}
            />
          </PaginationItem>

          {/* PAGE NUMBERS */}
          {getPages().map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={currentPage === page}
                className="cursor-pointer"
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* NEXT */}
          <PaginationItem>
            <PaginationNext
              className={
                currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }
              onClick={() => onPageChange(currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
