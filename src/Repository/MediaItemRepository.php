<?php

namespace VideInfra\CMSBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaItemRepository extends EntityRepository
{
    /**
     * @param $category
     * @return mixed
     */
    public function findByCategory($category)
    {
        $queryBuilder = $this->createQueryBuilder('i');

        if (empty($category)) {
            $queryBuilder->andWhere('i.category IS NULL');
        }
        else {
            $queryBuilder
                ->andWhere('i.category = :category')
                ->setParameter('category', $category);
        }

        return $queryBuilder
            ->orderBy('i.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}