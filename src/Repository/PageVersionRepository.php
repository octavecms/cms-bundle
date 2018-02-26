<?php

namespace VideInfra\CMSBundle\Repository;

use Doctrine\ORM\EntityRepository;
use VideInfra\CMSBundle\Entity\Page;
use VideInfra\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class PageVersionRepository extends EntityRepository
{
    /**
     * @param Page $page
     * @param $number
     * @return PageVersion
     */
    public function create(Page $page, $number)
    {
        $version = new PageVersion();
        $version->setPage($page);
        $version->setVersion($number);

        $this->getEntityManager()->persist($version);

        return $version;
    }

    /**
     * @param Page $page
     * @return PageVersion
     */
    public function findLast(Page $page)
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.page = :page')
            ->setParameter('page', $page)
            ->orderBy('v.version', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}