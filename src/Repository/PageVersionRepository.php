<?php

namespace Octave\CMSBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Entity\PageVersion;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
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
     * @param $number
     * @return mixed|PageVersion
     */
    public function fetchOrCreate(Page $page, $number)
    {
        $version = $this->findOneByVersion($page, $number);
        if (!$version) {
            $version = $this->create($page, $number);
        }

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

    /**
     * @param Page $page
     * @param $number
     * @return mixed
     */
    public function findOneByVersion(Page $page, $number)
    {
        return $this->findOneBy(['page' => $page, 'version' => $number]);
    }
}